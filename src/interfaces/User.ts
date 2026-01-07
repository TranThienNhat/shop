export type UserRole = "user" | "admin";

export interface IUser {
  id?: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  is_active?: boolean | number;
  last_login_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}
