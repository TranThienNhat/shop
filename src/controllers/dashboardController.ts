import { Request, Response } from "express";
import pool from "../config/db";

export const getDashboardStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const connection = await pool.getConnection();
    try {
      const [productsCount]: any = await connection.query(
        "SELECT COUNT(*) as count FROM products WHERE status != 'hidden'"
      );

      const [usersCount]: any = await connection.query(
        "SELECT COUNT(*) as count FROM users WHERE is_active = 1"
      );

      const [ordersCount]: any = await connection.query(
        "SELECT COUNT(*) as count FROM orders"
      );

      // Dùng final_amount thay vì total
      const [revenueResult]: any = await connection.query(
        "SELECT COALESCE(SUM(final_amount), 0) as total FROM orders WHERE status = 'completed'"
      );

      const [recentOrders]: any = await connection.query(`
        SELECT id, order_code, final_amount, status, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 10
      `);

      // Top sản phẩm bán chạy qua order_items -> product_variants
      const [topProducts]: any = await connection.query(`
        SELECT p.id, p.name, SUM(oi.quantity) as sold_qty, MIN(pv.price) as min_price
        FROM order_items oi
        JOIN product_variants pv ON oi.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed'
        GROUP BY p.id, p.name
        ORDER BY sold_qty DESC
        LIMIT 5
      `);

      const [monthlyRevenue]: any = await connection.query(`
        SELECT
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COALESCE(SUM(final_amount), 0) as revenue,
          COUNT(*) as orders
        FROM orders
        WHERE status = 'completed'
          AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `);

      const [orderStatusStats]: any = await connection.query(`
        SELECT status, COUNT(*) as count, COALESCE(SUM(final_amount), 0) as total_amount
        FROM orders
        GROUP BY status
      `);

      return res.json({
        message: "Lấy thống kê dashboard thành công",
        data: {
          totalProducts: productsCount[0].count,
          totalUsers: usersCount[0].count,
          totalOrders: ordersCount[0].count,
          totalRevenue: parseFloat(revenueResult[0].total),
          recentOrders,
          topProducts,
          monthlyRevenue,
          orderStatusStats,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getRevenueStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { period = "month" } = req.query;

    let dateFormat = "%Y-%m";
    let interval = "12 MONTH";

    if (period === "week") { dateFormat = "%Y-%u"; interval = "12 WEEK"; }
    else if (period === "year") { dateFormat = "%Y"; interval = "5 YEAR"; }

    const [revenueStats]: any = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        COALESCE(SUM(final_amount), 0) as revenue,
        COUNT(*) as orders,
        AVG(final_amount) as avg_order_value
      FROM orders
      WHERE status = 'completed'
        AND created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
      ORDER BY period DESC
    `);

    return res.json({ message: "Lấy thống kê doanh thu thành công", data: revenueStats });
  } catch (error) {
    console.error("Revenue stats error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
