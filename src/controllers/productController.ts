import { Request, Response } from "express";
import Product, { ProductVariant, Gallery } from "../models/ProductModel";
import fs from "fs";
import path from "path";
import pool from "../config/db";

const deleteFile = (filePath: string | undefined | null) => {
  if (!filePath) return;
  try {
    const cleanedPath = filePath.startsWith("/")
      ? filePath.substring(1)
      : filePath;
    const fullPath = path.join(process.cwd(), cleanedPath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (err) {
    console.error(">>> Lỗi xóa file:", err);
  }
};

// --- 1. LẤY DANH SÁCH ---
export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const search =
      (req.query.search as string) || (req.query.keyword as string);
    const category_id = req.query.category_id
      ? parseInt(req.query.category_id as string)
      : undefined;
    const brand_id = req.query.brand_id
      ? parseInt(req.query.brand_id as string)
      : undefined;
    const status = req.query.status as string;

    // Lấy thêm min_price và max_price từ query
    const min_price = req.query.min_price
      ? parseFloat(req.query.min_price as string)
      : undefined;
    const max_price = req.query.max_price
      ? parseFloat(req.query.max_price as string)
      : undefined;

    const where: any = {};
    if (status && status !== "all") where.status = status;
    if (category_id) where.category_id = category_id;
    if (brand_id) where.brand_id = brand_id;

    // Truyền thêm min_price, max_price vào hàm findAll
    const products = await Product.findAll({
      where,
      search,
      limit,
      offset,
      min_price, // Thêm dòng này
      max_price, // Thêm dòng này
      orderBy: "id",
      orderDir: "DESC",
    } as any);

    const total = await Product.count({
      where,
      search,
      min_price, // Đừng quên đếm tổng cũng cần lọc giá
      max_price,
    } as any);

    return res.json({
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(">>> Error index:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- 2. TẠO MỚI ---
export const create = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { name, slug, category_id, brand_id, description, status } = req.body;
    const variants = JSON.parse(req.body.variants || "[]");
    const files = req.files as Express.Multer.File[];

    const productId = await Product.create({
      name,
      slug: slug || `${Date.now()}`,
      category_id: Number(category_id),
      brand_id: brand_id && brand_id !== "null" ? Number(brand_id) : null,
      description,
      status: status || "active",
    } as any);

    for (const v of variants) {
      await ProductVariant.create({
        ...v,
        product_id: productId,
        price: Number(v.price),
        stock_qty: Number(v.stock_qty),
      } as any);
    }

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await Gallery.create({
          product_id: productId,
          image_url: `/uploads/products/${files[i].filename}`,
          is_main: i === 0 ? 1 : 0,
          sort_order: i,
        } as any);
      }
    }
    return res.status(201).json({ message: "Thành công", id: productId });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- 3. CẬP NHẬT ---
export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    slug,
    category_id,
    brand_id,
    description,
    status,
    variants: variantsStr,
  } = req.body;
  const files = req.files as Express.Multer.File[];

  // Khởi tạo connection để dùng transaction (tùy thuộc vào thư viện mysql2 bạn đang dùng)
  // Giả sử bạn đang dùng pool.promise()
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction(); // Bắt đầu giao dịch

    // 1. Kiểm tra sản phẩm tồn tại
    const current = await Product.findById(Number(id));
    if (!current) {
      await connection.rollback();
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // 2. Cập nhật thông tin cơ bản
    await Product.update(Number(id), {
      name,
      slug: slug || current.slug,
      category_id: Number(category_id),
      brand_id: brand_id && brand_id !== "null" ? Number(brand_id) : null,
      description,
      status,
    } as any);

    // 3. Xử lý Variants (Đồng bộ hóa: Update, Insert, Delete)
    let incomingVariants = [];
    try {
      incomingVariants =
        typeof variantsStr === "string"
          ? JSON.parse(variantsStr)
          : variantsStr || [];
    } catch (e) {
      throw new Error("Định dạng variants không hợp lệ");
    }

    // Lấy các variant đang có trong DB
    const existingVariants = await ProductVariant.findByProductId(Number(id));
    const existingIds = existingVariants.map((v: any) => v.id);
    const incomingIds = incomingVariants
      .filter((v: any) => v.id)
      .map((v: any) => Number(v.id));

    // --- A. XỬ LÝ XÓA ---
    const idsToDelete = existingIds.filter(
      (exId) => !incomingIds.includes(exId),
    );
    for (const deleteId of idsToDelete) {
      try {
        await ProductVariant.delete(deleteId);
      } catch (err: any) {
        // Nếu dính khóa ngoại (cart_items), báo lỗi và dừng transaction
        throw new Error(
          `Không thể xóa biến thể ID ${deleteId} vì đang có trong giỏ hàng khách hàng.`,
        );
      }
    }

    // --- B. XỬ LÝ UPDATE & INSERT ---
    for (const v of incomingVariants) {
      const variantData = {
        product_id: Number(id),
        variant_name: v.variant_name || v.name, // Khớp với DB của bạn
        price: Number(v.price),
        stock_qty: Number(v.stock_qty),
        variant_image: v.variant_image || null,
      };

      if (v.id && existingIds.includes(Number(v.id))) {
        await ProductVariant.update(Number(v.id), variantData);
      } else {
        await ProductVariant.create(variantData);
      }
    }

    // 4. Xử lý Hình ảnh (Nếu có file mới thì mới thay thế)
    if (files && files.length > 0) {
      const oldGalleries = await Gallery.findAllByProductId(Number(id));

      // Xóa ảnh vật lý
      if (oldGalleries && oldGalleries.length > 0) {
        oldGalleries.forEach((g: any) => {
          if (typeof deleteFile === "function") deleteFile(g.image_url);
        });
      }

      // Xóa trong DB và thêm mới
      await Gallery.deleteByProductId(Number(id));
      const galleryPromises = files.map((file, i) => {
        return Gallery.create({
          product_id: Number(id),
          image_url: `/uploads/products/${file.filename}`,
          is_main: i === 0 ? 1 : 0,
          sort_order: i,
        } as any);
      });
      await Promise.all(galleryPromises);
    }

    await connection.commit(); // Hoàn tất mọi thay đổi
    return res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (error: any) {
    await connection.rollback(); // Hủy bỏ mọi thay đổi nếu có lỗi xảy ra
    console.error("Lỗi cập nhật:", error);
    return res.status(500).json({
      message: error.message || "Lỗi server",
      error: error.message,
    });
  } finally {
    connection.release(); // Giải phóng connection trả về pool
  }
};

// --- 4. CHI TIẾT ---
export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Gọi hàm tìm kiếm theo ID trong Model
    const product = await Product.findWithVariants(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
      });
    }

    // Trả về dữ liệu đầy đủ bao gồm variants và galleries
    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(">>> Error in Product Show:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy chi tiết sản phẩm",
    });
  }
};

// --- 5. XÓA ---
export const remove = async (req: Request, res: Response) => {
  try {
    const product = await Product.findWithVariants(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy" });
    if (product.galleries) {
      product.galleries.forEach((g: any) => deleteFile(g.image_url));
    }
    await Product.delete(req.params.id);
    return res.json({ message: "Xóa thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const allVariants = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        pv.id, 
        p.name as product_name, 
        pv.variant_name, 
        pv.price, 
        pv.stock_qty
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE p.status = 'active'
      ORDER BY p.name ASC
    `);

    // Trả về bọc trong object success và data để đồng bộ với FE
    return res.json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    console.error(">>> Error allVariants:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách biến thể",
      error: error.message,
    });
  }
};
