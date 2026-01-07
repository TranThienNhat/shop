import { BaseModel } from "../core/BaseModel";
import { IReview } from "../interfaces/Review";

class ReviewModel extends BaseModel<IReview> {
  constructor() {
    super("reviews");
  }

  // Check xem user đã mua hàng chưa
  async hasPurchased(userId: number, productId: number): Promise<boolean> {
    const sql = `
            SELECT COUNT(*) as count 
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            WHERE o.user_id = ? AND od.product_id = ? AND o.status = 'completed'
        `;
    const [rows]: any[] = await this.db.query(sql, [userId, productId]);
    return rows[0].count > 0;
  }
}

export default new ReviewModel();
