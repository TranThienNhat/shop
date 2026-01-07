import { BaseModel } from "../core/BaseModel";
import { IProduct } from "../interfaces/Product";

class ProductModel extends BaseModel<IProduct> {
  constructor() {
    super("products");
  }

  // Override findAll để hỗ trợ search và price range
  async findAll(options: any = {}): Promise<IProduct[]> {
    let sql = `SELECT * FROM ${this.tableName} WHERE 1=1`;
    const values: any[] = [];

    // Where conditions từ BaseModel
    if (options.where) {
      Object.keys(options.where).forEach((key) => {
        sql += ` AND ${key} = ?`;
        values.push(options.where[key]);
      });
    }

    // Search functionality
    if (options.search) {
      sql += ` AND (name LIKE ? OR short_description LIKE ? OR content LIKE ?)`;
      const searchTerm = `%${options.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    // Price range
    if (options.minPrice !== undefined) {
      sql += ` AND price >= ?`;
      values.push(options.minPrice);
    }

    if (options.maxPrice !== undefined) {
      sql += ` AND price <= ?`;
      values.push(options.maxPrice);
    }

    // Order by
    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy} ${options.orderDir || "ASC"}`;
    }

    // Limit and offset
    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
      if (options.offset) {
        sql += ` OFFSET ${options.offset}`;
      }
    }

    const [rows] = await this.db.query(sql, values);
    return rows as IProduct[];
  }

  // Override count để hỗ trợ search và price range
  async count(options: any = {}): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE 1=1`;
    const values: any[] = [];

    // Where conditions
    if (options.where) {
      Object.keys(options.where).forEach((key) => {
        sql += ` AND ${key} = ?`;
        values.push(options.where[key]);
      });
    }

    // Search functionality
    if (options.search) {
      sql += ` AND (name LIKE ? OR short_description LIKE ? OR content LIKE ?)`;
      const searchTerm = `%${options.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    // Price range
    if (options.minPrice !== undefined) {
      sql += ` AND price >= ?`;
      values.push(options.minPrice);
    }

    if (options.maxPrice !== undefined) {
      sql += ` AND price <= ?`;
      values.push(options.maxPrice);
    }

    const [rows]: any = await this.db.query(sql, values);
    return rows[0].count;
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
