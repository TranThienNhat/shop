import { BaseModel } from "../core/BaseModel";
import { ICart, ICartItem } from "../interfaces/Cart";
import pool from "../config/db";

class CartModel extends BaseModel<ICart> {
  constructor() {
    super("carts");
  }

  // Tìm giỏ hàng theo user hoặc session
  async findCart(userId?: number, sessionId?: string) {
    if (userId) return this.findOne({ user_id: userId });
    if (sessionId) return this.findOne({ session_id: sessionId });
    return null;
  }

  // Lấy chi tiết item trong giỏ (Join với Product)
  async getCartItems(cartId: number) {
    const sql = `
            SELECT ci.id, ci.product_id, ci.quantity, 
                   p.name, p.price, p.sale_price, p.image_url, p.slug
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `;
    const [rows] = await this.db.query(sql, [cartId]);
    return rows as any[];
  }

  // Thêm item vào giỏ (Nếu có rồi thì tăng số lượng)
  async addItem(cartId: number, productId: number, quantity: number) {
    // Check item tồn tại
    const [existing]: any[] = await this.db.query(
      "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQty = existing[0].quantity + quantity;
      await this.db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        newQty,
        existing[0].id,
      ]);
    } else {
      // Insert new
      await this.db.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
        [cartId, productId, quantity]
      );
    }
  }

  // Xóa item
  async removeItem(cartId: number, productId: number) {
    await this.db.query(
      "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId]
    );
  }

  // Xóa sạch giỏ (Sau khi đặt hàng)
  async clearCart(cartId: number) {
    await this.db.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
  }
}

export default new CartModel();
