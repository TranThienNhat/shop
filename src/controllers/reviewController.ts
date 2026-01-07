import { Request, Response } from "express";
import Review from "../models/ReviewModel";
import { IUser } from "../interfaces/User"; // 1. Import thêm Interface User

// 2. Định nghĩa Interface mở rộng để TS hiểu req.user
interface AuthRequest extends Request {
  user?: IUser;
}

export const createReview = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // 3. Ép kiểu req sang AuthRequest
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const { product_id, rating, comment } = req.body;

    // 1. Validate
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Số sao từ 1 đến 5" });
    }

    // 2. Check quyền: Phải mua rồi mới được review
    // (Bỏ qua bước này nếu muốn cho review tự do)
    /* const canReview = await Review.hasPurchased(userId!, product_id);
        if (!canReview) {
             return res.status(403).json({ message: "Bạn phải mua sản phẩm này mới được đánh giá" });
        }
        */

    // 3. Tạo review
    await Review.create({
      user_id: userId,
      product_id,
      rating,
      comment,
    });

    return res.status(201).json({ message: "Đánh giá thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getProductReviews = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { productId } = req.params;

    // Lưu ý: Truy cập ["db"] là cách "hack" để vào property protected của BaseModel.
    // Cách chuẩn hơn là viết hàm getReviewsByProductId trong ReviewModel.
    // Nhưng để chạy nhanh thì giữ nguyên cũng được.
    const sql = `
            SELECT r.*, u.name as user_name, u.avatar 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = ? 
            ORDER BY r.created_at DESC
        `;

    // Ép kiểu any cho Review để tránh lỗi truy cập private/protected property "db"
    const [reviews] = await (Review as any)["db"].query(sql, [productId]);

    return res.json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getProductReviewsBySlug = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { slug } = req.params;

    const sql = `
            SELECT r.*, u.name as user_name, u.avatar 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            JOIN products p ON r.product_id = p.id
            WHERE p.slug = ? 
            ORDER BY r.created_at DESC
        `;

    const [reviews] = await (Review as any)["db"].query(sql, [slug]);

    return res.json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
