export interface ICoupon {
  id?: number;
  code: string;
  name?: string;
  description?: string;
  type: "percentage" | "fixed_amount";
  value: number;
  min_order_value?: number;
  max_discount_value?: number;
  quantity?: number;
  used_count?: number;
  start_date?: Date;
  end_date?: Date;
  status?: "active" | "inactive" | "expired";
  created_at?: Date;
  updated_at?: Date;
}

export interface ICouponValidation {
  isValid: boolean;
  message?: string;
  discount?: number;
  coupon?: ICoupon;
}
