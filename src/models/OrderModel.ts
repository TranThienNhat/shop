import { BaseModel } from "../core/BaseModel";
import { IOrder } from "../interfaces/Order";
import pool from "../config/db";

class OrderModel extends BaseModel<IOrder> {
  constructor() {
    super("orders");
  }

  async findAll(options: any = {}) {
    let sql = `
      SELECT o.*,
             GROUP_CONCAT(
               JSON_OBJECT(
                 'id', oi.id,
                 'variant_id', oi.variant_id,
                 'name', p.name,
                 'variant_name', pv.variant_name,
                 'price', oi.price,
                 'quantity', oi.quantity,
                 'image_url', (SELECT image_url FROM product_galleries WHERE product_id = p.id ORDER BY is_main DESC, sort_order ASC LIMIT 1)
               )
             ) as items_json
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      LEFT JOIN products p ON pv.product_id = p.id
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
      if (options.offset) sql += ` OFFSET ${options.offset}`;
    }

    const [rows]: any = await this.db.query(sql, values);
    return rows.map((row: any) => ({
      ...row,
      items: row.items_json ? JSON.parse(`[${row.items_json}]`) : [],
    }));
  }

  // Transaction tạo đơn hàng theo schema mới
  async createOrderTransaction(
    orderData: IOrder & {
      shipping_name?: string;
      shipping_phone?: string;
      shipping_address?: string;
      shipping_email?: string;
      payment_method?: string;
    },
    items: any[]
  ) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert order với các cột đúng theo schema mới
      const [orderResult]: any = await connection.query(
        `INSERT INTO orders (user_id, order_code, total_amount, discount_amount, final_amount, coupon_id, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
          orderData.user_id,
          orderData.order_code,
          orderData.total_amount,
          orderData.discount_amount || 0,
          orderData.final_amount,
          orderData.coupon_id || null,
        ]
      );
      const orderId = orderResult.insertId;

      // 2. Insert order_items (snapshot giá) & trừ tồn kho variant
      for (const item of items) {
        await connection.query(
          `INSERT INTO order_items (order_id, variant_id, price, quantity) VALUES (?, ?, ?, ?)`,
          [orderId, item.variant_id, item.price, item.quantity]
        );

        await connection.query(
          `UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ?`,
          [item.quantity, item.variant_id]
        );
      }

      // 3. Ghi nhận coupon usage nếu có
      if (orderData.coupon_id && orderData.user_id) {
        await connection.query(
          `INSERT INTO coupon_user (coupon_id, user_id, order_id) VALUES (?, ?, ?)`,
          [orderData.coupon_id, orderData.user_id, orderId]
        );
        await connection.query(
          `UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`,
          [orderData.coupon_id]
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new OrderModel();
