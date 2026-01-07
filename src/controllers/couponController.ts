import { Request, Response } from "express";
import Coupon from "../models/CouponModel";
import { IUser } from "../interfaces/User";

interface AuthRequest extends Request {
  user?: IUser;
}

// --- VALIDATE COUPON ---
export const validateCoupon = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { code, orderValue } = req.body;

    if (!code || !orderValue) {
      return res
        .status(400)
        .json({ message: "Thiếu mã giảm giá hoặc giá trị đơn hàng" });
    }

    const validation = await Coupon.validateCoupon(
      code,
      parseFloat(orderValue)
    );

    if (validation.isValid) {
      return res.json({
        success: true,
        message: validation.message,
        discount: validation.discount,
        coupon: validation.coupon,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }
  } catch (error) {
    console.error("Validate coupon error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- GET AVAILABLE COUPONS ---
export const getAvailableCoupons = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { orderValue } = req.query;
    const value = orderValue ? parseFloat(orderValue as string) : 0;

    const coupons = await Coupon.getAvailableCoupons(value);

    return res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Get available coupons error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- ADMIN: CREATE COUPON ---
export const createCoupon = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const authReq = req as AuthRequest;

    // Check admin permission
    if (!authReq.user || authReq.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const {
      code,
      name,
      description,
      type,
      value,
      min_order_value,
      max_discount_value,
      quantity,
      start_date,
      end_date,
    } = req.body;

    // Validate required fields
    if (!code || !type || !value) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findByCode(code);
    if (existingCoupon) {
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
    }

    const couponId = await Coupon.create({
      code,
      name,
      description,
      type,
      value,
      min_order_value,
      max_discount_value,
      quantity,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      status: "active",
      used_count: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      couponId,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- ADMIN: GET ALL COUPONS ---
export const getAllCoupons = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const authReq = req as AuthRequest;

    // Check admin permission
    if (!authReq.user || authReq.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const coupons = await Coupon.findAll({
      limit: parseInt(limit as string),
      offset,
    });

    const total = await Coupon.count();

    return res.json({
      success: true,
      coupons,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Get all coupons error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- ADMIN: UPDATE COUPON ---
export const updateCoupon = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const authReq = req as AuthRequest;

    // Check admin permission
    if (!authReq.user || authReq.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.used_count;
    delete updateData.created_at;
    delete updateData.updated_at;

    await Coupon.update(parseInt(id), updateData);

    return res.json({
      success: true,
      message: "Cập nhật mã giảm giá thành công",
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- ADMIN: DELETE COUPON ---
export const deleteCoupon = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const authReq = req as AuthRequest;

    // Check admin permission
    if (!authReq.user || authReq.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const { id } = req.params;

    await Coupon.delete(parseInt(id));

    return res.json({
      success: true,
      message: "Xóa mã giảm giá thành công",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
