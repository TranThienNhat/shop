import { Router } from "express";
import {
  addToCart,
  getCart,
  removeItem,
  updateItemQuantity,
  applyCoupon,
  removeCoupon,
  clearCart,
} from "../controllers/cartController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate, getCart);
router.post("/add", authenticate, addToCart);

// Coupon routes (đặt trước các routes có params)
router.post("/coupon/apply", authenticate, applyCoupon);
router.delete("/coupon", authenticate, removeCoupon);

// Clear cart route
router.delete("/clear", authenticate, clearCart);

// Product-specific routes (đặt sau để tránh conflict)
router.put("/:productId", authenticate, updateItemQuantity);
router.delete("/:productId", authenticate, removeItem);

// Test route without auth for debugging
router.post("/test-add", addToCart);

export default router;
