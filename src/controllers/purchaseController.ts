import { Request, Response } from "express";
import pool from "../config/db";
import { Purchase } from "../models/PurchaseModel";

export const PurchaseController = {
  // =====================================================================
  // 1. LẤY DANH SÁCH PHIẾU NHẬP (Phân trang & Tính tổng tiền)
  // =====================================================================
  index: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const [items]: any = await pool.query(
        `
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
      `,
        [limit, offset],
      );

      const [countResult]: any = await pool.query(
        "SELECT COUNT(*) as total FROM purchase_receipts",
      );
      const total = countResult[0].total;

      return res.json({
        success: true,
        data: items,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      console.error(">>> Lỗi INDEX phiếu nhập:", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi lấy danh sách", error: error.message });
    }
  },

  // =====================================================================
  // 2. CHI TIẾT PHIẾU NHẬP
  // =====================================================================
  show: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Lấy dữ liệu phiếu từ Model kèm mảng details []
      const data = await Purchase.findWithDetails(Number(id));

      if (!data)
        return res.status(404).json({ success: false, message: "Không tìm thấy phiếu nhập" });

      // Tính toán tổng tiền từ mảng chi tiết trước khi trả về (Hỗ trợ cả trường unit_price hoặc cost_price)
      const total_amount = data.details?.reduce((sum: number, item: any) => {
        const price = Number(item.unit_price) || Number(item.cost_price) || 0;
        return sum + (Number(item.quantity) || 0) * price;
      }, 0) || 0;

      return res.json({
        success: true,
        data: {
          ...data,
          total_amount: total_amount, // Trả về kèm theo để frontend render dễ dàng
        },
      });
    } catch (error: any) {
      console.error(">>> Lỗi SHOW chi tiết phiếu nhập:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // =====================================================================
  // 3. TẠO MỚI PHIẾU NHẬP (Cộng kho & Cập nhật giá bán tự động)
  // =====================================================================
  create: async (req: any, res: Response) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { supplier_id, note, items } = req.body;
      const user_id = req.user?.id || 1; 

      // 1. Kiểm tra dữ liệu đầu vào nghiêm ngặt
      if (!supplier_id) throw new Error("Vui lòng chọn nhà cung cấp!");
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Danh sách hàng nhập không được để trống!");
      }

      // 2. Chống lỗi dữ liệu rỗng mang giá trị 'undefined' khi gửi vào SQL
      const safeNote = note !== undefined && note !== "" ? note : null;

      // 3. Tạo phiếu nhập gốc
      const [result]: any = await connection.execute(
        "INSERT INTO purchase_receipts (supplier_id, user_id, note, created_at) VALUES (?, ?, ?, NOW())",
        [Number(supplier_id), Number(user_id), safeNote],
      );
      const receiptId = result.insertId;

      // 4. Duyệt mảng hàng nhập để xử lý chi tiết & kho
      for (const item of items) {
        const variantId = item.product_variant_id || item.variant_id;
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || Number(item.cost_price) || 0;

        if (!variantId || isNaN(variantId)) {
          throw new Error("Có một dòng sản phẩm chưa được chọn đúng biến thể!");
        }
        if (quantity <= 0) {
          throw new Error("Số lượng nhập của các mặt hàng phải lớn hơn 0!");
        }

        // 4.1. Chèn dữ liệu vào bảng chi tiết phiếu nhập
        await connection.execute(
          "INSERT INTO purchase_receipt_details (receipt_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [receiptId, variantId, quantity, unitPrice],
        );

        // 4.2. Cộng dồn số lượng kho + cập nhật luôn giá bán mới nhất vào bảng biến thể
        await connection.execute(
          "UPDATE product_variants SET stock_qty = stock_qty + ?, price = ? WHERE id = ?",
          [quantity, unitPrice, variantId],
        );
      }

      await connection.commit();
      return res.status(201).json({
        success: true,
        message: "Tạo phiếu nhập hàng thành công!",
        id: receiptId,
      });
    } catch (error: any) {
      await connection.rollback();
      console.error(">>> Lỗi CREATE phiếu nhập:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Lỗi hệ thống khi tạo phiếu nhập.",
      });
    } finally {
      connection.release();
    }
  },

  // =====================================================================
  // 4. CHỈNH SỬA PHIẾU NHẬP (Hoàn tác kho cũ an toàn -> Lưu dữ liệu mới)
  // =====================================================================
  update: async (req: any, res: Response) => {
    const connection = await pool.getConnection();
    const { id } = req.params;
    const { supplier_id, note, items } = req.body; // Đồng bộ key nhận 'items' từ FE

    try {
      await connection.beginTransaction();

      if (!items || !Array.isArray(items)) {
        throw new Error("Danh sách sản phẩm không hợp lệ hoặc bị trống.");
      }

      // --- BƯỚC 1: HOÀN TÁC KHO CŨ ---
      const [oldDetails]: any = await connection.query(
        "SELECT variant_id, quantity FROM purchase_receipt_details WHERE receipt_id = ?",
        [id],
      );

      for (const old of oldDetails) {
        // Sử dụng hàm GREATEST để ngăn chặn kho bị âm nếu sản phẩm đã lỡ bán cho khách
        await connection.query(
          "UPDATE product_variants SET stock_qty = GREATEST(stock_qty - ?, 0) WHERE id = ?",
          [old.quantity, old.variant_id],
        );
      }

      // --- BƯỚC 2: XÓA CHI TIẾT CŨ ---
      await connection.query(
        "DELETE FROM purchase_receipt_details WHERE receipt_id = ?",
        [id],
      );

      // --- BƯỚC 3: CẬP NHẬT THÔNG TIN PHIẾU NHẬP CHÍNH ---
      const safeNote = note !== undefined && note !== "" ? note : null;
      await connection.query(
        "UPDATE purchase_receipts SET supplier_id = ?, note = ? WHERE id = ?",
        [Number(supplier_id), safeNote, id],
      );

      // --- BƯỚC 4: THÊM CHI TIẾT MỚI & CẬP NHẬT LẠI KHO/GIÁ MỚI ---
      for (const item of items) {
        const variantId = item.product_variant_id || item.variant_id;
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || Number(item.cost_price) || 0;

        if (!variantId || isNaN(variantId)) {
          throw new Error("Phát hiện dòng hàng chưa được chọn sản phẩm/biến thể đúng cách!");
        }
        if (quantity <= 0) {
          throw new Error("Số lượng hàng nhập chỉnh sửa phải lớn hơn 0!");
        }

        // Lưu chi tiết lô hàng mới
        await connection.query(
          "INSERT INTO purchase_receipt_details (receipt_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [id, variantId, quantity, unitPrice],
        );

        // Cộng dồn kho mới + cập nhật giá bán mới nhất tương ứng
        await connection.query(
          "UPDATE product_variants SET stock_qty = stock_qty + ?, price = ? WHERE id = ?",
          [quantity, unitPrice, variantId],
        );
      }

      await connection.commit();
      return res.json({
        success: true,
        message: "Cập nhật phiếu nhập và tồn kho thành công!",
      });
    } catch (error: any) {
      await connection.rollback();
      console.error(">>> Lỗi UPDATE phiếu nhập:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Lỗi hệ thống khi cập nhật phiếu nhập.",
      });
    } finally {
      connection.release();
    }
  },

  // =====================================================================
  // 5. XÓA PHIẾU NHẬP (Hoàn tác kho chống âm hoàn toàn)
  // =====================================================================
  remove: async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;

      // 1. Lấy thông tin các mặt hàng cũ trong phiếu nhập để hoàn trả kho
      const [details]: any = await connection.query(
        "SELECT variant_id, quantity FROM purchase_receipt_details WHERE receipt_id = ?",
        [id],
      );

      for (const item of details) {
        // Tích hợp GREATEST chống sập số lượng âm khi xóa phiếu cũ
        await connection.query(
          "UPDATE product_variants SET stock_qty = GREATEST(stock_qty - ?, 0) WHERE id = ?",
          [item.quantity, item.variant_id],
        );
      }

      // 2. Thực hiện xóa phiếu chính
      // (Chi tiết trong purchase_receipt_details tự động sạch bản ghi nhờ ON DELETE CASCADE)
      await Purchase.delete(Number(id));

      await connection.commit();
      return res.json({ success: true, message: "Xóa phiếu nhập và hoàn tác kho thành công" });
    } catch (error: any) {
      await connection.rollback();
      console.error(">>> Lỗi REMOVE phiếu nhập:", error);
      return res.status(500).json({ success: false, message: error.message });
    } finally {
      connection.release();
    }
  },
};