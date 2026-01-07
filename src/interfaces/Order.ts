export interface IOrder {
  id?: number;
  user_id?: number;
  code: string;
  subtotal?: number;
  discount_amount?: number;
  total: number;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_email?: string;
  coupon_code?: string;
  coupon_id?: number;
  status?: string;
  created_at?: Date;
}
