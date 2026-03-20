import { Router } from "express";
import { index, create, update, remove } from "../controllers/categoryController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";
import { uploadCategory } from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/", index);
router.post("/", authenticate, requireAdmin, uploadCategory.single("image"), create);
router.put("/:id", authenticate, requireAdmin, uploadCategory.single("image"), update);
router.delete("/:id", authenticate, requireAdmin, remove);

export default router;