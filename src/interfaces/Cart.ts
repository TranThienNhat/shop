export interface ICart {
  id?: number;
  user_id?: number | null;
  session_id?: string | null;
  coupon_code?: string | null;
  discount_amount?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ICartItem {
  id?: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  created_at?: Date;
  updated_at?: Date;
}
