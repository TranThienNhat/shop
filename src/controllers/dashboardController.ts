import { Request, Response } from "express";
import pool from "../config/db";

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const connection = await pool.getConnection();

    try {
      // Lấy tổng số sản phẩm
      const [productsCount]: any = await connection.query(
        "SELECT COUNT(*) as count FROM products WHERE status != 'hidden'"
      );

      // Lấy tổng số người dùng
      const [usersCount]: any = await connection.query(
        "SELECT COUNT(*) as count FROM users WHERE is_active = 1"
      );

      // Lấy tổng số đơn hàng
      const [ordersCount]: any = await connection.query(
        "SELECT COUNT(*) as count FROM orders"
      );

      // Lấy tổng doanh thu (chỉ tính đơn hàng completed)
      const [revenueResult]: any = await connection.query(
        "SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'completed'"
      );

      // Lấy đơn hàng gần đây (10 đơn mới nhất)
      const [recentOrders]: any = await connection.query(`
        SELECT id, code, shipping_name, total, status, created_at 
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 10
      `);

      // Lấy sản phẩm bán chạy (top 5 theo sold_qty)
      const [topProducts]: any = await connection.query(`
        SELECT id, name, price, stock_qty, sold_qty 
        FROM products 
        WHERE status != 'hidden'
        ORDER BY sold_qty DESC 
        LIMIT 5
      `);

      // Thống kê theo tháng (doanh thu 12 tháng gần nhất)
      const [monthlyRevenue]: any = await connection.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as orders
        FROM orders 
        WHERE status = 'completed' 
          AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `);

      // Thống kê trạng thái đơn hàng
      const [orderStatusStats]: any = await connection.query(`
        SELECT 
          status,
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as total_amount
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

export const getRevenueStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { period = "month" } = req.query; // month, week, year

    let dateFormat = "%Y-%m";
    let interval = "12 MONTH";

    switch (period) {
      case "week":
        dateFormat = "%Y-%u";
        interval = "12 WEEK";
        break;
      case "year":
        dateFormat = "%Y";
        interval = "5 YEAR";
        break;
      default:
        dateFormat = "%Y-%m";
        interval = "12 MONTH";
    }

    const [revenueStats]: any = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders,
        AVG(total) as avg_order_value
      FROM orders 
      WHERE status = 'completed' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
      ORDER BY period DESC
    `);

    return res.json({
      message: "Lấy thống kê doanh thu thành công",
      data: revenueStats,
    });
  } catch (error) {
    console.error("Revenue stats error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
