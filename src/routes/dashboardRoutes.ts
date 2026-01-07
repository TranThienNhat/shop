import { Router } from "express";
import {
  getDashboardStats,
  getRevenueStats,
} from "../controllers/dashboardController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Admin dashboard routes
router.get("/stats", authenticate, requireAdmin, getDashboardStats);
router.get("/revenue", authenticate, requireAdmin, getRevenueStats);

export default router;
