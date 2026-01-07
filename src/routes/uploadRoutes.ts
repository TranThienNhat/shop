import { Router } from "express";
import { uploadSingle, uploadMultiple } from "../controllers/uploadController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";

const router = Router();

// Upload single file (admin only)
router.post(
  "/single",
  authenticate,
  requireAdmin,
  upload.single("file"),
  uploadSingle
);

// Upload multiple files (admin only)
router.post(
  "/multiple",
  authenticate,
  requireAdmin,
  upload.array("files", 10),
  uploadMultiple
);

// Upload image (general endpoint for all types)
router.post(
  "/image",
  authenticate,
  requireAdmin,
  upload.single("image"),
  uploadSingle
);

export default router;
