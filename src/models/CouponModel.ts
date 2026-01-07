import { BaseModel } from "../core/BaseModel";
import { ICoupon, ICouponValidation } from "../interfaces/Coupon";

class CouponModel extends BaseModel<ICoupon> {
  constructor() {
    super("coupons");
  }

  // Tìm coupon theo code
  async findByCode(code: string): Promise<ICoupon | null> {
    return this.findOne({ code });
  }

  // Validate coupon
  async validateCoupon(
    code: string,
    orderValue: number
  ): Promise<ICouponValidation> {
    const coupon = await this.findByCode(code);

    if (!coupon) {
      return { isValid: false, message: "Mã giảm giá không tồn tại" };
    }

    // Check status
    if (coupon.status !== "active") {
      return { isValid: false, message: "Mã giảm giá không hoạt động" };
    }

    // Check date range
    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return { isValid: false, message: "Mã giảm giá chưa có hiệu lực" };
    }

    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return { isValid: false, message: "Mã giảm giá đã hết hạn" };
    }

    // Check quantity
    if (
      coupon.quantity &&
      coupon.used_count &&
      coupon.used_count >= coupon.quantity
    ) {
      return { isValid: false, message: "Mã giảm giá đã hết lượt sử dụng" };
    }

    // Check minimum order value
    if (coupon.min_order_value && orderValue < coupon.min_order_value) {
      return {
        isValid: false,
        message: `Đơn hàng tối thiểu ${coupon.min_order_value.toLocaleString()}đ để sử dụng mã này`,
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (orderValue * coupon.value) / 100;
      // Apply max discount limit if exists
      if (coupon.max_discount_value && discount > coupon.max_discount_value) {
        discount = coupon.max_discount_value;
      }
    } else {
      discount = coupon.value;
    }

    // Discount cannot exceed order value
    if (discount > orderValue) {
      discount = orderValue;
    }

    return {
      isValid: true,
      discount,
      coupon,
      message: `Giảm ${discount.toLocaleString()}đ`,
    };
  }

  // Tăng số lần sử dụng coupon
  async incrementUsage(couponId: number) {
    await this.db.query(
      "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
      [couponId]
    );
  }

  // Lấy danh sách coupon có thể sử dụng
  async getAvailableCoupons(orderValue: number) {
    const sql = `
      SELECT * FROM coupons 
      WHERE status = 'active' 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
        AND (quantity IS NULL OR used_count < quantity)
        AND (min_order_value IS NULL OR min_order_value <= ?)
      ORDER BY value DESC
    `;

    const [rows] = await this.db.query(sql, [orderValue]);
    return rows as ICoupon[];
  }
}

export default new CouponModel();
