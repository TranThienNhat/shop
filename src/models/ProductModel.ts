import { BaseModel } from "../core/BaseModel";
import { IProduct, IProductVariant } from "../interfaces/Product";

class ProductModel extends BaseModel<IProduct> {
  constructor() {
    super("products");
  }

  // Lấy danh sách sản phẩm kèm giá thấp nhất từ variants
  async findAll(options: any = {}): Promise<any[]> {
    let sql = `
      SELECT p.*, 
             MIN(pv.price) as min_price,
             MAX(pv.price) as max_price,
             SUM(pv.stock_qty) as total_stock,
             c.name as category_name,
             b.name as brand_name
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (options.where) {
      Object.keys(options.where).forEach((key) => {
        sql += ` AND p.${key} = ?`;
        values.push(options.where[key]);
      });
    }

    if (options.search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      const term = `%${options.search}%`;
      values.push(term, term);
    }

    if (options.minPrice !== undefined) {
      sql += ` AND pv.price >= ?`;
      values.push(options.minPrice);
    }

    if (options.maxPrice !== undefined) {
      sql += ` AND pv.price <= ?`;
      values.push(options.maxPrice);
    }

    sql += ` GROUP BY p.id`;

    if (options.orderBy) {
      sql += ` ORDER BY p.${options.orderBy} ${options.orderDir || "ASC"}`;
    }

    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
      if (options.offset) {
        sql += ` OFFSET ${options.offset}`;
      }
    }

    const [rows] = await this.db.query(sql, values);
    return rows as any[];
  }

  async count(options: any = {}): Promise<number> {
    let sql = `SELECT COUNT(DISTINCT p.id) as count FROM products p LEFT JOIN product_variants pv ON p.id = pv.product_id WHERE 1=1`;
    const values: any[] = [];

    if (options.where) {
      Object.keys(options.where).forEach((key) => {
        sql += ` AND p.${key} = ?`;
        values.push(options.where[key]);
      });
    }

    if (options.search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      const term = `%${options.search}%`;
      values.push(term, term);
    }

    const [rows]: any = await this.db.query(sql, values);
    return rows[0].count;
  }

  // Lấy sản phẩm kèm tất cả variants
  async findWithVariants(id: number | string): Promise<any | null> {
    const [products]: any = await this.db.query(
      `SELECT p.*, c.name as category_name, b.name as brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.id = ?`,
      [id]
    );
    if (!products.length) return null;

    const [variants] = await this.db.query(
      `SELECT * FROM product_variants WHERE product_id = ?`,
      [id]
    );

    return { ...products[0], variants };
  }

  async findBySlugWithVariants(slug: string): Promise<any | null> {
    const [products]: any = await this.db.query(
      `SELECT p.*, c.name as category_name, b.name as brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.slug = ?`,
      [slug]
    );
    if (!products.length) return null;

    const [variants] = await this.db.query(
      `SELECT * FROM product_variants WHERE product_id = ?`,
      [products[0].id]
    );

    return { ...products[0], variants };
  }
}

class ProductVariantModel extends BaseModel<IProductVariant> {
  constructor() {
    super("product_variants");
  }

  async findByProductId(productId: number): Promise<IProductVariant[]> {
    const [rows] = await this.db.query(
      `SELECT * FROM product_variants WHERE product_id = ?`,
      [productId]
    );
    return rows as IProductVariant[];
  }

  async deleteByProductId(productId: number) {
    await this.db.query(`DELETE FROM product_variants WHERE product_id = ?`, [productId]);
  }
}

export const ProductVariant = new ProductVariantModel();
export default new ProductModel();
