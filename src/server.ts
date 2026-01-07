import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import brandRoutes from "./routes/brandRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import userRoutes from "./routes/userRoutes";
import uploadRoutes from "./routes/uploadRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- ROUTES ---
// 1. Auth (Đăng ký, Đăng nhập)
app.use("/api/auth", authRoutes);

// 2. Catalog (Sản phẩm, Danh mục, Thương hiệu)
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);

// 3. Shopping (Giỏ hàng, Đặt hàng)
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// 4. Social (Đánh giá)
app.use("/api/reviews", reviewRoutes);

// 5. Admin (Quản lý người dùng)
app.use("/api/users", userRoutes);

// 6. Upload (Upload files)
app.use("/api/upload", uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
