import { Request, Response } from "express";
import Product, { ProductVariant, Gallery } from "../models/ProductModel";
import fs from "fs";
import path from "path";

const deleteFile = (filePath: string | undefined | null) => {
  if (!filePath) return;
  try {
    const cleanedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
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

    const search = (req.query.search as string) || (req.query.keyword as string);
    const category_id = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;
    const brand_id = req.query.brand_id ? parseInt(req.query.brand_id as string) : undefined;
    const status = req.query.status as string;

    const where: any = {};
    if (status && status !== "all") where.status = status;
    if (category_id) where.category_id = category_id;
    if (brand_id) where.brand_id = brand_id;

    // Fix lỗi TS2353 bằng cách ép kiểu sang any
    const products = await Product.findAll({ 
      where, search, limit, offset, orderBy: "id", orderDir: "DESC" 
    } as any);
    
    const total = await Product.count({ where, search } as any);

    return res.json({ 
      data: products, 
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) } 
    });
  } catch (error) {
    console.error(">>> Error index:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- 2. TẠO MỚI ---
export const create = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, slug, category_id, brand_id, description, status } = req.body;
    const variants = JSON.parse(req.body.variants || "[]");
    const files = req.files as Express.Multer.File[];

    const productId = await Product.create({
      name,
      slug: slug || `${Date.now()}`,
      category_id: Number(category_id),
      brand_id: brand_id && brand_id !== 'null' ? Number(brand_id) : null,
      description,
      status: status || "active"
    } as any);

    for (const v of variants) {
      await ProductVariant.create({ 
        ...v, product_id: productId, price: Number(v.price), stock_qty: Number(v.stock_qty)
      } as any);
    }

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await Gallery.create({
          product_id: productId,
          image_url: `/uploads/products/${files[i].filename}`,
          is_main: i === 0 ? 1 : 0,
          sort_order: i
        } as any);
      }
    }
    return res.status(201).json({ message: "Thành công", id: productId });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- 3. CẬP NHẬT ---
export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, slug, category_id, brand_id, description, status, variants: variantsStr } = req.body;
    const files = req.files as Express.Multer.File[];

    const current = await Product.findById(id);
    if (!current) return res.status(404).json({ message: "Không tìm thấy" });

    await Product.update(id, {
      name, slug: slug || current.slug,
      category_id: Number(category_id),
      brand_id: brand_id && brand_id !== 'null' ? Number(brand_id) : null,
      description, status
    } as any);

    await ProductVariant.deleteByProductId(Number(id));
    const variants = JSON.parse(variantsStr || "[]");
    for (const v of variants) {
      await ProductVariant.create({ 
        ...v, product_id: Number(id), price: Number(v.price), stock_qty: Number(v.stock_qty)
      } as any);
    }

    if (files && files.length > 0) {
      const oldGalleries = await Gallery.findAll({ where: { product_id: Number(id) } } as any);
      oldGalleries.forEach((g: any) => deleteFile(g.image_url));
      await Gallery.deleteByProductId(Number(id));

      for (let i = 0; i < files.length; i++) {
        await Gallery.create({
          product_id: Number(id),
          image_url: `/uploads/products/${files[i].filename}`,
          is_main: i === 0 ? 1 : 0,
          sort_order: i
        } as any);
      }
    }
    return res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
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
        message: "Sản phẩm không tồn tại" 
      });
    }

    // Trả về dữ liệu đầy đủ bao gồm variants và galleries
    return res.json({ 
      success: true,
      data: product 
    });
  } catch (error) {
    console.error(">>> Error in Product Show:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi hệ thống khi lấy chi tiết sản phẩm" 
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