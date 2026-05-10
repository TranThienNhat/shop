import { Request, Response } from "express";
import pool from "../config/db";
import { Purchase } from "../models/PurchaseModel";

export const PurchaseController = {
  // --- 1. LẤY DANH SÁCH PHIẾU NHẬP ---
  index: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const [items]: any = await pool.query(`
        SELECT 
          pr.*, 
          s.name as supplier_name,
          u.name as user_name,
          (SELECT SUM(quantity * unit_price) 
           FROM purchase_receipt_details 
           WHERE receipt_id = pr.id) as total_amount
        FROM purchase_receipts pr
        LEFT JOIN suppliers s ON pr.supplier_id = s.id
        LEFT JOIN users u ON pr.user_id = u.id
        ORDER BY pr.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const [countResult]: any = await pool.query("SELECT COUNT(*) as total FROM purchase_receipts");
      const total = countResult[0].total;

      return res.json({
        data: items,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Lỗi lấy danh sách", error: error.message });
    }
  },

  // --- 2. CHI TIẾT PHIẾU NHẬP ---
  show: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Giả sử Purchase.findWithDetails trả về object { ..., details: [] }
      const data = await Purchase.findWithDetails(Number(id));

      if (!data)
        return res.status(404).json({ message: "Không tìm thấy phiếu nhập" });

      // Tính toán tổng tiền từ mảng chi tiết trước khi trả về
      const total_amount = data.details.reduce((sum: number, item: any) => {
        return sum + item.quantity * item.cost_price;
      }, 0);

      return res.json({
        data: {
          ...data,
          total_amount: total_amount, // Trả về kèm theo để frontend render
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  // --- 3. TẠO PHIẾU NHẬP (Xử lý biến thể mới & Cộng kho) ---
  create: async (req: any, res: Response) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { supplier_id, note, items } = req.body;
      const user_id = req.user?.id || 1; 

      const [result]: any = await connection.execute(
        "INSERT INTO purchase_receipts (supplier_id, user_id, note, created_at) VALUES (?, ?, ?, NOW())",
        [supplier_id, user_id, note]
      );
      const receiptId = result.insertId;

      for (const item of items) {
        // SỬA TÊN CỘT: receipt_id, variant_id, unit_price
        await connection.execute(
          "INSERT INTO purchase_receipt_details (receipt_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [receiptId, item.product_variant_id, item.quantity, item.unit_price]
        );

        // Cập nhật tồn kho
        await connection.execute(
          "UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?",
          [item.quantity, item.product_variant_id]
        );
      }

      await connection.commit();
      return res.status(201).json({ message: "Nhập hàng thành công!", id: receiptId });
    } catch (error: any) {
      await connection.rollback();
      return res.status(500).json({ message: error.message });
    } finally {
      connection.release();
    }
  },
  // --- 4. SỬA PHIẾU NHẬP (Hoàn tác kho cũ -> Cập nhật -> Cộng kho mới) ---
  update: async (req: any, res: Response) => {
    const connection = await pool.getConnection();
    const { id } = req.params;
    const { supplier_id, note, details } = req.body;

    try {
      await connection.beginTransaction();

      // Bước 1: Lấy chi tiết cũ để HOÀN TÁC KHO (Trừ đi lượng đã cộng trước đó)
      const [oldDetails]: any = await connection.query(
        "SELECT variant_id, quantity FROM purchase_receipt_details WHERE receipt_id = ?",
        [id],
      );
      for (const old of oldDetails) {
        await connection.query(
          "UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ?",
          [old.quantity, old.variant_id],
        );
      }

      // Bước 2: Xóa chi tiết phiếu cũ
      await connection.query(
        "DELETE FROM purchase_receipt_details WHERE receipt_id = ?",
        [id],
      );

      // Bước 3: Cập nhật thông tin phiếu nhập chính
      await connection.query(
        "UPDATE purchase_receipts SET supplier_id = ?, note = ? WHERE id = ?",
        [supplier_id, note, id],
      );

      // Bước 4: Thêm chi tiết mới & Xử lý biến thể & Cộng kho mới
      for (const item of details) {
        let variant_id = item.variant_id;

        // Nếu trong lúc sửa lại thêm một biến thể mới chưa từng có
        if (!variant_id) {
          const [vResult]: any = await connection.query(
            "INSERT INTO product_variants (product_id, variant_name, price, stock_qty) VALUES (?, ?, ?, ?, 0)",
            [item.product_id, item.variant_name, item.price],
          );
          variant_id = vResult.insertId;
        }

        await connection.query(
          "INSERT INTO purchase_receipt_details (receipt_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [id, variant_id, item.quantity, item.unit_price],
        );

        await connection.query(
          "UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?",
          [item.quantity, variant_id],
        );
      }

      await connection.commit();
      return res.json({ message: "Cập nhật phiếu nhập và tồn kho thành công" });
    } catch (error: any) {
      await connection.rollback();
      return res.status(500).json({ message: error.message });
    } finally {
      connection.release();
    }
  },

  // --- 5. XÓA PHIẾU NHẬP (Hoàn tác kho) ---
  remove: async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;

      // 1. Lấy thông tin các mặt hàng để trừ lại kho
      const [details]: any = await connection.query(
        "SELECT variant_id, quantity FROM purchase_receipt_details WHERE receipt_id = ?",
        [id],
      );

      for (const item of details) {
        await connection.query(
          "UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ?",
          [item.quantity, item.variant_id],
        );
      }

      // 2. Xóa phiếu nhập (Bảng chi tiết tự xóa nhờ CONSTRAINT ... ON DELETE CASCADE)
      await Purchase.delete(Number(id));

      await connection.commit();
      return res.json({ message: "Xóa phiếu nhập và hoàn tác kho thành công" });
    } catch (error: any) {
      await connection.rollback();
      return res.status(500).json({ message: error.message });
    } finally {
      connection.release();
    }
  },
};
