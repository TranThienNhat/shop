import { Router } from "express";
import {
  createReview,
  getProductReviews,
  getProductReviewsBySlug,
} from "../controllers/reviewController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createReview);
router.get("/product/:productId", getProductReviews);
router.get("/product/slug/:slug", getProductReviewsBySlug);

export default router;
