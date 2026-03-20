export interface IOrder {
  id?: number;
  user_id?: number;
  order_code: string;
  total_amount: number;
  discount_amount?: number;
  final_amount: number;
  coupon_id?: number;
  status?: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  created_at?: Date;
}
