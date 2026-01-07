import { BaseModel } from "../core/BaseModel";
import { IOrder } from "../interfaces/Order";
import pool from "../config/db";

class OrderModel extends BaseModel<IOrder> {
  constructor() {
    super("orders");
  }

  // Lấy đơn hàng với chi tiết sản phẩm
  async findAll(options: any = {}) {
    let sql = `
      SELECT o.*, 
             GROUP_CONCAT(
               JSON_OBJECT(
                 'id', od.id,
                 'product_id', od.product_id,
                 'name', od.product_name,
                 'price', od.price,
                 'quantity', od.quantity,
                 'image_url', p.image_url
               )
             ) as items_json
      FROM orders o
      LEFT JOIN order_details od ON o.id = od.order_id
      LEFT JOIN products p ON od.product_id = p.id
    `;

    const values: any[] = [];

    if (options.where) {
      const conditions = Object.keys(options.where).map((key) => {
        values.push(options.where[key]);
        return `o.${key} = ?`;
      });
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` GROUP BY o.id`;

    if (options.orderBy) {
      sql += ` ORDER BY o.${options.orderBy} ${options.orderDir || "ASC"}`;
    }

    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
      if (options.offset) {
        sql += ` OFFSET ${options.offset}`;
      }
    }

    const [rows]: any = await this.db.query(sql, values);

    // Parse JSON items and map field names for frontend compatibility
    return rows.map((row: any) => ({
      ...row,
      total_amount: row.total, // Map total to total_amount for frontend
      items: row.items_json ? JSON.parse(`[${row.items_json}]`) : [],
    }));
  }

  // Transaction tạo đơn hàng hoàn chỉnh
  async createOrderTransaction(orderData: IOrder, items: any[]) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction(); // Bắt đầu Transaction

      // Get coupon_id if coupon_code is provided
      let couponId = null;
      if (orderData.coupon_code) {
        const [couponResult]: any = await connection.query(
          "SELECT id FROM coupons WHERE code = ?",
          [orderData.coupon_code]
        );
        if (couponResult.length > 0) {
          couponId = couponResult[0].id;
        }
      }

      // 1. Insert Order
      const [orderResult]: any = await connection.query(
        `INSERT INTO orders (user_id, code, subtotal, discount_amount, total, payment_method, shipping_name, shipping_phone, shipping_address, shipping_email, coupon_id, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          orderData.user_id,
          orderData.code,
          orderData.subtotal || orderData.total,
          orderData.discount_amount || 0,
          orderData.total,
          orderData.payment_method,
          orderData.shipping_name,
          orderData.shipping_phone,
          orderData.shipping_address,
          orderData.shipping_email,
          couponId,
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
