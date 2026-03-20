import { Router } from "express";
import {
  index,
  show,
  create,
  update,
  remove,
} from "../controllers/productController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";
import { uploadProduct } from "../middlewares/uploadMiddleware";

const router = Router();

// --- Public Routes ---
router.get("/", index);
router.get("/:id", show);

// --- Protected Routes (Chỉ dành cho Admin) ---

/**
 * TẠO MỚI SẢN PHẨM
 * - authenticate: Kiểm tra token
 * - requireAdmin: Kiểm tra quyền admin
 * - uploadProduct.array("images", 10): Nhận tối đa 10 file với key là "images"
 */
router.post(
  "/", 
  authenticate, 
  requireAdmin, 
  uploadProduct.array("images", 10), 
  create
);

/**
 * CẬP NHẬT SẢN PHẨM
 * Tương tự như tạo mới, cho phép gửi kèm ảnh mới để thay thế gallery cũ
 */
router.put(
  "/:id", 
  authenticate, 
  requireAdmin, 
  uploadProduct.array("images", 10), 
  update
);

/**
 * XÓA SẢN PHẨM
 */
router.delete("/:id", authenticate, requireAdmin, remove);

export default router;