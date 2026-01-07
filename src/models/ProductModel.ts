import { BaseModel } from "../core/BaseModel";
import { IProduct } from "../interfaces/Product";

class ProductModel extends BaseModel<IProduct> {
  constructor() {
    super("products");
  }
  async filterProducts(params: {
    keyword?: string;
    min_price?: number;
    max_price?: number;
    category_id?: number;
    limit: number;
    offset: number;
  }) {
    let sql = `SELECT * FROM ${this.tableName} WHERE 1=1`;
    const values: any[] = [];

    if (params.keyword) {
      sql += ` AND name LIKE ?`;
      values.push(`%${params.keyword}%`);
    }

    if (params.category_id) {
      sql += ` AND category_id = ?`;
      values.push(params.category_id);
    }

    if (params.min_price) {
      sql += ` AND price >= ?`;
      values.push(params.min_price);
    }

    if (params.max_price) {
      sql += ` AND price <= ?`;
      values.push(params.max_price);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    values.push(params.limit, params.offset);

    const [rows] = await this.db.query(sql, values);
    return rows;
  }
}

export default new ProductModel();
