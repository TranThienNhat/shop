export interface IProduct {
  id?: number;
  category_id?: number;
  brand_id?: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  stock_qty?: number;
  image_url?: string;
  description?: string;
  status?: "in_stock" | "out_of_stock" | "hidden";
  created_at?: Date;
  updated_at?: Date;
}
