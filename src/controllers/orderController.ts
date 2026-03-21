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

    const { shipping_info, payment_method, notes } = req.body; 
    
    if (!shipping_info?.name || !shipping_info?.phone || !shipping_info?.address) {
      return res.status(400).json({ message: "Thiếu thông tin giao hàng" });
    }

    const cart = await Cart.findOne({ user_id: userId } as any);
    if (!cart) return res.status(400).json({ message: "Giỏ hàng trống" });

    const cartInfo = await Cart.getCartWithCoupon(cart.id!);
    if (cartInfo.items.length === 0) return res.status(400).json({ message: "Giỏ hàng trống" });

    // TÍNH PHÍ VẬN CHUYỂN
    const shipping_fee = cartInfo.subtotal >= 500000 ? 0 : 30000;
    const final_amount = cartInfo.total + shipping_fee; 

    const order_code = `ORD-${Date.now()}`;

    // Tạo đơn hàng vào DB
    const orderId = await Order.createOrderTransaction(
      {
        user_id: userId,
        order_code,
        total_amount: cartInfo.subtotal,
        discount_amount: cartInfo.discount,
        shipping_fee,
        final_amount,
        coupon_id: cartInfo.couponId || undefined,
        shipping_name: shipping_info.name,
        shipping_phone: shipping_info.phone,
        shipping_address: shipping_info.address,
        shipping_email: authReq.user?.email,
        notes: notes || null,                    
        payment_method,
      },
      cartInfo.items
    );

    // Xóa giỏ hàng
    await Cart.clearCart(cart.id!);

    // --- LẤY DATA GỬI VỀ FRONTEND ---
    // Chúng ta trả về một object chứa đầy đủ thông tin để trang Success hiển thị
    return res.json({ 
      message: "Đặt hàng thành công", 
      order: {
        id: orderId,
        order_code,
        shipping_info: {
          name: shipping_info.name,
          phone: shipping_info.phone,
          address: shipping_info.address,
          notes: notes || null
        },
        items: cartInfo.items, // Gửi danh sách SP để hiện ở trang Success
        payment_method,
        summary: {
          subtotal: cartInfo.subtotal,
          discount: cartInfo.discount,
          shipping_fee,
          final_amount
        },
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error(">>> Checkout Error:", error);
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

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const orderId = parseInt(id);
    const currentUser = req.user; // Lấy từ middleware authenticate

    // 1. Tìm đơn hàng hiện tại
    const currentOrder = await Order.findById(orderId);
    if (!currentOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng này nàng ơi!" });
    }

    // 2. KIỂM TRA PHÂN QUYỀN (Logic mấu chốt)
    const isAdmin = currentUser?.role === "admin";
    const isOwner = currentUser?.id === currentOrder.user_id;

    if (!isAdmin) {
      // Nếu không phải Admin thì bắt buộc phải là chủ đơn
      if (!isOwner) {
        return res.status(403).json({ message: "Nàng không có quyền chỉnh sửa đơn hàng của người khác" });
      }
      // Chủ đơn CHỈ được phép chuyển trạng thái sang "cancelled"
      if (status !== "cancelled") {
        return res.status(403).json({ message: "Nàng chỉ có thể yêu cầu hủy đơn hàng thôi ạ" });
      }
    }

    // 3. Kiểm tra trạng thái đơn hàng hiện tại (Chống hủy đơn đã giao/xong)
    if (currentOrder.status === "cancelled" || currentOrder.status === "completed") {
      return res.status(400).json({ message: "Đơn hàng này đã đóng, không thể thay đổi nữa" });
    }
    
    // Nếu là khách hàng, chỉ được hủy khi đơn chưa giao (pending hoặc processing)
    if (!isAdmin && currentOrder.status !== "pending" && currentOrder.status !== "processing") {
       return res.status(400).json({ message: "Đơn hàng đã được gửi đi, nàng vui lòng liên hệ hotline để hỗ trợ nhé" });
    }

    // 4. XỬ LÝ HOÀN KHO (Nếu status mới là cancelled)
    if (status === "cancelled") {
      const [items]: any = await (Order as any).db.query(
        "SELECT variant_id, quantity FROM order_items WHERE order_id = ?",
        [orderId]
      );

      for (const item of items) {
        await (Order as any).db.query(
          "UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?",
          [item.quantity, item.variant_id]
        );
      }
    }

    // 5. Cập nhật trạng thái
    await Order.update(orderId, { status });

    return res.json({ 
      success: true, 
      message: status === "cancelled" ? "Hủy đơn và hoàn trả kho thành công ✨" : "Cập nhật trạng thái thành công" 
    });

  } catch (error) {
    console.error(">>> Order Update Error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống, nàng vui lòng thử lại sau" });
  }
};
