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
        // Nếu dính khóa ngoại (cart_items, order_items), báo lỗi và dừng transaction
        throw new Error(
          `Không thể xóa biến thể ID ${deleteId} vì đang tồn tại trong giỏ hàng hoặc đơn hàng.`,
        );
      }
    }

    // --- B. XỬ LÝ UPDATE & INSERT (KHẮC PHỤC LỖI NaN TẠI ĐÂY) ---
    for (const v of incomingVariants) {
      // Ép kiểu an toàn
      const priceNum = Number(v.price);
      const stockNum = Number(v.stock_qty);

      const variantData = {
        product_id: Number(id),
        variant_name: v.variant_name || v.name || "Mặc định", // Khớp với DB của bạn

        // CỐT LÕI: Kiểm tra isNaN. Nếu dữ liệu rác/lỗi -> fallback về 0.
        price: isNaN(priceNum) ? 0 : priceNum,
        stock_qty: isNaN(stockNum) ? 0 : stockNum,

        variant_image: v.variant_image || null,
      };

      // Cập nhật nếu đã có ID và nằm trong danh sách hiện tại
      if (v.id && existingIds.includes(Number(v.id))) {
        await ProductVariant.update(Number(v.id), variantData);
      } else {
        // Tạo mới nếu chưa có ID
        await ProductVariant.create(variantData);
      }
    }

    // 4. Xử lý Hình ảnh (Nếu có file mới thì mới thay thế)
    if (files && files.length > 0) {
      const oldGalleries = await Gallery.findAllByProductId(Number(id));

      // Xóa ảnh vật lý khỏi ổ cứng/storage
      if (oldGalleries && oldGalleries.length > 0) {
        oldGalleries.forEach((g: any) => {
          if (typeof deleteFile === "function") deleteFile(g.image_url);
        });
      }

      // Xóa bản ghi trong DB và thêm mới
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

    await connection.commit(); // Hoàn tất mọi thay đổi (Transaction thành công)

    return res.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error: any) {
    await connection.rollback(); // Hủy bỏ mọi thay đổi nếu có lỗi xảy ra
    console.error("Lỗi cập nhật sản phẩm:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi server trong quá trình cập nhật",
      error: error.message,
    });
  } finally {
    connection.release(); // Quan trọng: Giải phóng connection trả về pool
  }
};

export const addVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Lấy product_id từ URL dạng /products/:id/variants

    // 1. ÉP KIỂU VÀ CHẶN NGAY LỖI NaN CỦA PRODUCT_ID
    const productIdNum = Number(id);
    if (isNaN(productIdNum) || productIdNum <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Yêu cầu thất bại: ID sản phẩm gốc không hợp lệ hoặc bị truyền lên dạng NaN!",
      });
    }

    // 2. Kiểm tra xem sản phẩm gốc thực sự có tồn tại trong DB không
    const product = await Product.findById(productIdNum);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm gốc không tồn tại",
      });
    }

    const { variant_name, price, stock_qty, variant_image } = req.body;

    // 3. Ép kiểu an toàn cho price và stock_qty như cũ
    const priceNum = Number(price);
    const stockNum = Number(stock_qty);

    const variantData = {
      product_id: productIdNum, // Đã bảo đảm là số chuẩn, không lo dính NaN
      variant_name: variant_name || "Mặc định",
      price: isNaN(priceNum) ? 0 : priceNum,
      stock_qty: isNaN(stockNum) ? 0 : stockNum,
      variant_image: variant_image || null,
    };

    // 4. Gọi model để lưu vào Database
    const newVariant = await ProductVariant.create(variantData);

    return res.status(201).json({
      success: true,
      message: "Thêm biến thể mới thành công!",
      data: newVariant,
    });
  } catch (error: any) {
    console.error(">>> Lỗi khi thêm biến thể đơn lẻ:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi thêm biến thể",
    });
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
