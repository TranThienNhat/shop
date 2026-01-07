import { Router } from "express";
import { addToCart, getCart, removeItem } from "../controllers/cartController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate, getCart);
router.post("/add", authenticate, addToCart);
router.delete("/:productId", authenticate, removeItem);

export default router;
