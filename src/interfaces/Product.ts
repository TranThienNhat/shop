export interface IProduct {
  id?: number;
  category_id?: number;
  brand_id?: number;
  name: string;
  slug: string;
  description?: string;
  status?: "active" | "hidden";
  created_at?: Date;
}

export interface IProductVariant {
  id?: number;
  product_id: number;
  sku?: string;
  variant_name?: string;
  price: number;
  stock_qty?: number;
  variant_image?: string;
}
