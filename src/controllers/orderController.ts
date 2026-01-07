import { Request, Response } from "express";
import Order from "../models/OrderModel";
import Cart from "../models/CartModel";
import { IUser } from "../interfaces/User"; // 1. Import thêm Interface User

// 2. Định nghĩa Interface mở rộng để TS hiểu req.user
interface AuthRequest extends Request {
  user?: IUser;
}

export const checkout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // 3. Ép kiểu req sang AuthRequest
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id; // Bắt buộc phải đăng nhập

    const { shipping_name, shipping_phone, shipping_address, payment_method } =
      req.body;

    if (!userId)
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập để đặt hàng" });

    // 1. Lấy giỏ hàng
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) return res.status(400).json({ message: "Giỏ hàng trống" });

    const items = await Cart.getCartItems(cart.id!);
    if (items.length === 0)
      return res.status(400).json({ message: "Giỏ hàng trống" });

    // 2. Tính tổng tiền
    const total = items.reduce(
      (sum, item) => sum + (item.sale_price || item.price) * item.quantity,
      0
    );

    // 3. Tạo mã đơn hàng ngẫu nhiên (VD: ORD-123456)
    const code = `ORD-${Date.now()}`;

    // 4. Gọi Transaction tạo đơn
    const orderId = await Order.createOrderTransaction(
      {
        user_id: userId,
        code,
        total,
        payment_method,
        shipping_name,
        shipping_phone,
        shipping_address,
      },
      items
    );

    // 5. Xóa giỏ hàng sau khi đặt thành công
    await Cart.clearCart(cart.id!);

    return res.json({
      message: "Đặt hàng thành công",
      order_id: orderId,
      code,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi khi đặt hàng" });
  }
};

export const getMyOrders = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // 3. Ép kiểu req sang AuthRequest ở đây nữa
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      orderBy: "created_at",
      orderDir: "DESC",
    });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Admin functions
export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const orders = await Order.findAll({
      orderBy: "created_at",
      orderDir: "DESC",
    });
    return res.json({
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "shipping",
      "completed",
      "cancelled",
      "refunded",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const updated = await Order.update(parseInt(id), { status });
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    return res.json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
