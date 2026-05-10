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

      // Sử dụng phương thức từ BaseModel
      const items = await Purchase.findAll({
        limit,
        offset,
        orderBy: "created_at",
        orderDir: "DESC",
      });

      const total = await Purchase.count();

      return res.json({
        data: items,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  // --- 2. CHI TIẾT PHIẾU NHẬP ---
  show: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await Purchase.findWithDetails(Number(id));
      if (!data) return res.status(404).json({ message: "Không tìm thấy phiếu nhập" });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  // --- 3. TẠO PHIẾU NHẬP (Xử lý biến thể mới & Cộng kho) ---
  create: async (req: any, res: Response) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { supplier_id, note, details } = req.body;
      const user_id = req.user.id; // Lấy từ middleware authenticate

      // Tạo phiếu nhập chính
      const receiptId = await Purchase.create({ supplier_id, user_id, note });

      for (const item of details) {
        let variant_id = item.variant_id;

        // A. Nếu biến thể chưa tồn tại -> Tạo mới biến thể trước
        if (!variant_id) {
          const [vResult]: any = await connection.query(
            "INSERT INTO product_variants (product_id, variant_name, sku, price, stock_qty) VALUES (?, ?, ?, ?, 0)",
            [item.product_id, item.variant_name, item.sku, item.price]
          );
          variant_id = vResult.insertId;
        }

        // B. Lưu chi tiết phiếu nhập
        await connection.query(
          "INSERT INTO purchase_receipt_details (receipt_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [receiptId, variant_id, item.quantity, item.unit_price]
        );

        // C. Cộng tồn kho vào bảng biến thể
        await connection.query(
          "UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?",
          [item.quantity, variant_id]
        );
      }

      await connection.commit();
      return res.status(201).json({ message: "Nhập hàng thành công", id: receiptId });
    } catch (error: any) {
      await connection.rollback();
      console.error(">>> Create Purchase Error:", error);
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
        [id]
      );
      for (const old of oldDetails) {
        await connection.query(
          "UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ?",
          [old.quantity, old.variant_id]
        );
      }

      // Bước 2: Xóa chi tiết phiếu cũ
      await connection.query("DELETE FROM purchase_receipt_details WHERE receipt_id = ?", [id]);

      // Bước 3: Cập nhật thông tin phiếu nhập chính
      await connection.query(
        "UPDATE purchase_receipts SET supplier_id = ?, note = ? WHERE id = ?",
        [supplier_id, note, id]
      );

      // Bước 4: Thêm chi tiết mới & Xử lý biến thể & Cộng kho mới
      for (const item of details) {
        let variant_id = item.variant_id;

        // Nếu trong lúc sửa lại thêm một biến thể mới chưa từng có
        if (!variant_id) {
          const [vResult]: any = await connection.query(
            "INSERT INTO product_variants (product_id, variant_name, sku, price, stock_qty) VALUES (?, ?, ?, ?, 0)",
            [item.product_id, item.variant_name, item.sku, item.price]
          );
          variant_id = vResult.insertId;
        }

        await connection.query(
          "INSERT INTO purchase_receipt_details (receipt_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [id, variant_id, item.quantity, item.unit_price]
        );

        await connection.query(
          "UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?",
          [item.quantity, variant_id]
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
        [id]
      );

      for (const item of details) {
        await connection.query(
          "UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ?",
          [item.quantity, item.variant_id]
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