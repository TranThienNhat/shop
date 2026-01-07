import { Router } from "express";
import {
  index,
  show,
  showBySlug,
  create,
  update,
  remove,
} from "../controllers/productController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Public Routes
router.get("/", index);
router.get("/slug/:slug", showBySlug); // Route cho slug phải đặt trước :id
router.get("/:id", show);

// Protected Routes (Cần đăng nhập & Là Admin)
router.post("/", authenticate, requireAdmin, create);
router.put("/:id", authenticate, requireAdmin, update);
router.delete("/:id", authenticate, requireAdmin, remove);

export default router;
