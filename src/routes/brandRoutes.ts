import { Router } from "express";
import { index, create, update, remove } from "../controllers/brandController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", index);
router.post("/", authenticate, requireAdmin, create);
router.put("/:id", authenticate, requireAdmin, update);
router.delete("/:id", authenticate, requireAdmin, remove);

export default router;
