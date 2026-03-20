import { BaseModel } from "../core/BaseModel";
import { IReview } from "../interfaces/Review";

class ReviewModel extends BaseModel<IReview> {
  constructor() {
    super("reviews");
  }

  // Kiểm tra user đã mua sản phẩm chưa (qua order_items -> product_variants -> products)
  async hasPurchased(userId: number, productId: number): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE o.user_id = ? AND pv.product_id = ? AND o.status = 'completed'
    `;
    const [rows]: any[] = await this.db.query(sql, [userId, productId]);
    return rows[0].count > 0;
  }
}

export default new ReviewModel();
