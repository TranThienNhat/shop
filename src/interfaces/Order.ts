export interface IOrder {
  id?: number;
  user_id?: number;
  code: string;
  total: number;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  status?: string;
  created_at?: Date;
}
