import { Request, Response } from "express";
import Order from "../models/OrderModel";
import Cart from "../models/CartModel";
import { IUser } from "../interfaces/User";

interface AuthRequest extends Request {
  user?: IUser;
}

export const checkout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) return res.status(401).json({ message: "Vui lòng đăng nhập để đặt hàng" });

    const { shipping_info, payment_method } = req.body;
    if (!shipping_info?.name || !shipping_info?.phone || !shipping_info?.address) {
      return res.status(400).json({ message: "Thiếu thông tin giao hàng" });
    }

    const cart = await Cart.findOne({ user_id: userId } as any);
    if (!cart) return res.status(400).json({ message: "Giỏ hàng trống" });

    const cartInfo = await Cart.getCartWithCoupon(cart.id!);
    if (cartInfo.items.length === 0) return res.status(400).json({ message: "Giỏ hàng trống" });

    const order_code = `ORD-${Date.now()}`;

    const orderId = await Order.createOrderTransaction(
      {
        user_id: userId,
        order_code,
        total_amount: cartInfo.subtotal,
        discount_amount: cartInfo.discount,
        final_amount: cartInfo.total,
        coupon_id: cartInfo.couponId || undefined,
        shipping_name: shipping_info.name,
        shipping_phone: shipping_info.phone,
        shipping_address: shipping_info.address,
        shipping_email: authReq.user?.email,
        payment_method,
      },
      cartInfo.items
    );

    await Cart.clearCart(cart.id!);

    return res.json({ message: "Đặt hàng thành công", id: orderId, order_id: orderId, order_code });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi khi đặt hàng" });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<Response> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    if (!userId) return res.status(401).json({ message: "Vui lòng đăng nhập" });

    const orders = await Order.findAll({ where: { user_id: userId }, orderBy: "created_at", orderDir: "DESC" });
    return res.json({ message: "Lấy danh sách đơn hàng thành công", data: orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<Response> => {
  try {
    const orders = await Order.findAll({ orderBy: "created_at", orderDir: "DESC" });
    return res.json({ message: "Lấy danh sách đơn hàng thành công", data: orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const currentOrder = await Order.findById(parseInt(id));
    if (!currentOrder) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (currentOrder.status === "cancelled" || currentOrder.status === "completed") {
      return res.status(400).json({ message: "Không thể thay đổi trạng thái đơn hàng đã hủy hoặc hoàn tất" });
    }

    await Order.update(parseInt(id), { status });
    return res.json({ message: "Cập nhật trạng thái đơn hàng thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
