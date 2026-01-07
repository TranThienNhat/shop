import { BaseModel } from "../core/BaseModel";
import { ICart } from "../interfaces/Cart";

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

  // Override create method to ensure no coupon is applied initially
  async create(data: Partial<ICart>) {
    const cartData = {
      ...data,
      coupon_code: null,
      discount_amount: 0,
    };
    return super.create(cartData);
  }

  // Lấy chi tiết item trong giỏ (Join với Product)
  async getCartItems(cartId: number) {
    const sql = `
            SELECT ci.id, ci.product_id, ci.quantity, 
                   p.name, p.price, p.sale_price, p.image_url, p.slug, p.stock_qty, p.status
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ? AND p.status != 'hidden'
        `;
    const [rows] = await this.db.query(sql, [cartId]);
    return rows as any[];
  }

  // Thêm item vào giỏ (Nếu có rồi thì tăng số lượng)
  async addItem(cartId: number, productId: number, quantity: number) {
    // Validate input
    if (!cartId || !productId || !quantity) {
      throw new Error(
        "Missing required parameters: cartId, productId, quantity"
      );
    }

    if (isNaN(cartId) || isNaN(productId) || isNaN(quantity)) {
      throw new Error(
        "Invalid parameters: cartId, productId, quantity must be numbers"
      );
    }

    // Check if product exists and is available
    const [productCheck]: any[] = await this.db.query(
      "SELECT id, stock_qty, status FROM products WHERE id = ?",
      [productId]
    );

    if (productCheck.length === 0) {
      throw new Error(`Product with ID ${productId} does not exist`);
    }

    const product = productCheck[0];

    // Check product status
    if (product.status === "hidden") {
      throw new Error("Product is not available");
    }

    if (product.status === "out_of_stock") {
      throw new Error("Product is out of stock");
    }

    // Check stock quantity
    if (product.stock_qty < quantity) {
      throw new Error(`Not enough stock. Available: ${product.stock_qty}`);
    }

    // Check item tồn tại
    const [existing]: any[] = await this.db.query(
      "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId]
    );

    if (existing.length > 0) {
      // Update quantity - check total quantity against stock
      const newQty = existing[0].quantity + quantity;
      if (newQty > product.stock_qty) {
        throw new Error(
          `Not enough stock. Available: ${product.stock_qty}, requested: ${newQty}`
        );
      }

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

  // Cập nhật số lượng item trong giỏ
  async updateItemQuantity(
    cartId: number,
    productId: number,
    quantity: number
  ) {
    // Validate input
    if (!cartId || !productId || quantity < 1) {
      throw new Error("Invalid parameters");
    }

    // Check product stock
    const [productCheck]: any[] = await this.db.query(
      "SELECT stock_qty, status FROM products WHERE id = ?",
      [productId]
    );

    if (productCheck.length === 0) {
      throw new Error("Product not found");
    }

    const product = productCheck[0];

    if (product.status !== "in_stock") {
      throw new Error("Product is not available");
    }

    if (product.stock_qty < quantity) {
      throw new Error(`Not enough stock. Available: ${product.stock_qty}`);
    }

    // Update quantity
    await this.db.query(
      "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
      [quantity, cartId, productId]
    );
  }

  // Xóa item
  async removeItem(cartId: number, productId: number) {
    await this.db.query(
      "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId]
    );
  }

  // Áp dụng coupon cho giỏ hàng
  async applyCoupon(cartId: number, couponCode: string) {
    // Get cart total first
    const items = await this.getCartItems(cartId);
    const subtotal = items.reduce((sum, item) => {
      const price = item.sale_price || item.price;
      return sum + price * item.quantity;
    }, 0);

    // Import CouponModel here to avoid circular dependency
    const CouponModel = require("./CouponModel").default;
    const validation = await CouponModel.validateCoupon(couponCode, subtotal);

    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    // Store coupon info in cart
    await this.db.query(
      "UPDATE carts SET coupon_code = ?, discount_amount = ? WHERE id = ?",
      [couponCode, validation.discount, cartId]
    );

    return {
      subtotal,
      discount: validation.discount,
      total: subtotal - validation.discount,
      coupon: validation.coupon,
    };
  }

  // Xóa coupon khỏi giỏ hàng
  async removeCoupon(cartId: number) {
    await this.db.query(
      "UPDATE carts SET coupon_code = NULL, discount_amount = 0 WHERE id = ?",
      [cartId]
    );
  }

  // Lấy thông tin giỏ hàng với coupon
  async getCartWithCoupon(cartId: number) {
    const [cartInfo]: any[] = await this.db.query(
      "SELECT coupon_code, discount_amount FROM carts WHERE id = ?",
      [cartId]
    );

    const items = await this.getCartItems(cartId);
    const subtotal = items.reduce((sum, item) => {
      const price = item.sale_price || item.price;
      return sum + price * item.quantity;
    }, 0);

    const cart = cartInfo[0] || {};
    const discount = cart.discount_amount || 0;
    const total = subtotal - discount;

    return {
      items,
      subtotal,
      discount,
      total,
      couponCode: cart.coupon_code,
      itemCount: items.length,
    };
  }

  // Xóa sạch giỏ (Sau khi đặt hàng)
  async clearCart(cartId: number) {
    await this.db.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
  }
}

export default new CartModel();
