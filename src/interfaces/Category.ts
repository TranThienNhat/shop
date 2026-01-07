export interface ICategory {
  id?: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}
