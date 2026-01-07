import { Request, Response } from "express";
import Cart from "../models/CartModel";
import { IUser } from "../interfaces/User"; // 1. Import thêm Interface User

// 2. Định nghĩa Interface mở rộng ngay tại đây để TS hiểu req.user
interface AuthRequest extends Request {
  user?: IUser;
}

// Helper lấy định danh (User ID hoặc Session ID)
const getIdentity = (req: Request) => {
  // 3. Ép kiểu (Cast) req sang AuthRequest
  const authReq = req as AuthRequest;

  const userId = authReq.user?.id;
  const sessionId = req.headers["x-session-id"] as string;
  return { userId, sessionId };
};

// --- GET CART ---
export const getCart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId, sessionId } = getIdentity(req);
    if (!userId && !sessionId) return res.json({ items: [] });

    let cart = await Cart.findCart(userId, sessionId);

    if (!cart) return res.json({ items: [], total: 0 });

    const items = await Cart.getCartItems(cart.id!);

    // Tính tổng tiền
    const total = items.reduce((sum, item) => {
      const price = item.sale_price || item.price;
      return sum + price * item.quantity;
    }, 0);

    return res.json({ id: cart.id, items, total });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- ADD TO CART ---
export const addToCart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { productId, quantity } = req.body;
    const { userId, sessionId } = getIdentity(req);

    if (!userId && !sessionId)
      return res.status(400).json({ message: "Thiếu Session ID" });

    // 1. Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findCart(userId, sessionId);
    if (!cart) {
      const cartId = await Cart.create({
        user_id: userId || null,
        session_id: userId ? null : sessionId,
      });
      cart = { id: cartId } as any;
    }

    // 2. Thêm sản phẩm
    await Cart.addItem(cart!.id!, productId, quantity || 1);

    return res.json({ message: "Đã thêm vào giỏ" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- REMOVE ITEM ---
export const removeItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { productId } = req.params;
    const { userId, sessionId } = getIdentity(req);

    const cart = await Cart.findCart(userId, sessionId);
    if (cart) {
      await Cart.removeItem(cart.id!, parseInt(productId));
    }

    return res.json({ message: "Đã xóa sản phẩm" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};
