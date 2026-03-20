export interface ICategory {
  id?: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  created_at?: Date;
}
