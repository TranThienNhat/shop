import { Router } from "express";
import { PurchaseController } from "../controllers/purchaseController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();

// --- Quản lý Phiếu Nhập (Yêu cầu quyền Admin) ---
router.get("/", authenticate, requireAdmin, PurchaseController.index);
router.get("/:id", authenticate, requireAdmin, PurchaseController.show);
router.post("/", authenticate, requireAdmin, PurchaseController.create);
router.put("/:id", authenticate, requireAdmin, PurchaseController.update);
router.delete("/:id", authenticate, requireAdmin, PurchaseController.remove);

export default router;