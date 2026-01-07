export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  sale_price?: string;
  cost?: string;
  stock_qty: number;
  sold_qty?: number;
  image_url: string;
  description: string;
  short_description?: string;
  content?: string;
  capacity?: string;
  color?: string;
  ingredients?: string;
  status: string;
  category_id?: number;
  brand_id?: number;
  created_at: string;
  updated_at: string;
  galleries: Gallery[];
}

export interface Gallery {
  id: number;
  image_url: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: string;
  sale_price?: string;
  quantity: number;
  image_url: string;
  slug: string;
  stock_qty: number;
  status: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  code?: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  shipping_name?: string;
  shipping_phone?: string;
  shipping_address: string;
  shipping_email?: string;
  note?: string;
  phone: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiError {
  message: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CheckoutData {
  name: string;
  phone: string;
  address: string;
}
