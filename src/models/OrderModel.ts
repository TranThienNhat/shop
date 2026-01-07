import { BaseModel } from "../core/BaseModel";
import { IOrder } from "../interfaces/Order";
import pool from "../config/db";

class OrderModel extends BaseModel<IOrder> {
  constructor() {
    super("orders");
  }

  // Transaction tạo đơn hàng hoàn chỉnh
  async createOrderTransaction(orderData: IOrder, items: any[]) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction(); // Bắt đầu Transaction

      // 1. Insert Order
      const [orderResult]: any = await connection.query(
        `INSERT INTO orders (user_id, code, total, payment_method, shipping_name, shipping_phone, shipping_address, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          orderData.user_id,
          orderData.code,
          orderData.total,
          orderData.payment_method,
          orderData.shipping_name,
          orderData.shipping_phone,
          orderData.shipping_address,
        ]
      );
      const orderId = orderResult.insertId;

      // 2. Insert Order Details & Trừ tồn kho
      for (const item of items) {
        const price = item.sale_price || item.price;

        // Thêm chi tiết đơn
        await connection.query(
          `INSERT INTO order_details (order_id, product_id, product_name, price, quantity, total_price) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.name,
            price,
            item.quantity,
            price * item.quantity,
          ]
        );

        // Trừ tồn kho (Cần check xem còn đủ hàng không trước khi trừ - Bước này làm đơn giản trừ luôn)
        await connection.query(
          `UPDATE products SET stock_qty = stock_qty - ?, sold_qty = sold_qty + ? WHERE id = ?`,
          [item.quantity, item.quantity, item.product_id]
        );
      }

      await connection.commit(); // Lưu thay đổi
      return orderId;
    } catch (error) {
      await connection.rollback(); // Hoàn tác nếu lỗi
      throw error;
    } finally {
      connection.release(); // Trả kết nối về pool
    }
  }
}

export default new OrderModel();
