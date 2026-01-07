import { Request, Response } from "express";
import Product from "../models/ProductModel";
import Gallery from "../models/GalleryModel";
import { IProduct } from "../interfaces/Product";

// --- HELPER: Tạo Slug từ tên sản phẩm ---
const createSlug = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const keyword = req.query.keyword as string;
    const category_id = req.query.category_id
      ? parseInt(req.query.category_id as string)
      : undefined;
    const brand_id = req.query.brand_id
      ? parseInt(req.query.brand_id as string)
      : undefined;
    const status = req.query.status as string;

    const where: any = {};
    if (category_id) where.category_id = category_id;
    if (brand_id) where.brand_id = brand_id;
    if (status) where.status = status;
    else where.status = "in_stock";

    const products = await Product.findAll({
      where,
      limit,
      offset,
      orderBy: "created_at",
      orderDir: "DESC",
    });

    const total = await Product.count(where);

    return res.json({
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const galleries = await Gallery.findAll({
      where: { product_id: parseInt(id) },
      orderBy: "sort_order",
      orderDir: "ASC",
    });

    return res.json({
      message: "Lấy thông tin sản phẩm thành công",
      data: {
        ...product,
        galleries: galleries,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const showBySlug = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const galleries = await Gallery.findAll({
      where: { product_id: product.id },
      orderBy: "sort_order",
      orderDir: "ASC",
    });

    return res.json({
      message: "Lấy thông tin sản phẩm thành công",
      data: {
        ...product,
        galleries: galleries,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- CREATE: Tạo mới (Kèm ảnh Gallery) ---
export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { gallery, ...productData } = req.body;
    const { name, price } = productData as IProduct;

    if (!name || !price) {
      return res.status(400).json({ message: "Tên và giá là bắt buộc" });
    }

    const slug = createSlug(name) + "-" + Date.now();

    const newProductId = await Product.create({
      ...productData,
      slug,
      status: productData.status || "in_stock",
      stock_qty: productData.stock_qty || 0,
    });

    if (gallery && Array.isArray(gallery) && gallery.length > 0) {
      const galleryPromises = gallery.map((imgUrl: string, index: number) => {
        return Gallery.create({
          product_id: newProductId,
          image_url: imgUrl,
          sort_order: index,
        });
      });
      await Promise.all(galleryPromises);
    }

    return res.status(201).json({
      message: "Tạo sản phẩm thành công",
      id: newProductId,
      slug,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({ message: "Lỗi khi tạo sản phẩm" });
  }
};

// --- UPDATE: Cập nhật (Kèm replace ảnh Gallery) ---
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { gallery, ...productData } = req.body;
    delete productData.id;
    delete productData.created_at;
    delete productData.updated_at;
    if (productData.name) {
      productData.slug = createSlug(productData.name) + "-" + id;
    }

    const success = await Product.update(id, productData);

    if (!success) {
      const exists = await Product.findById(id);
      if (!exists)
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    if (gallery && Array.isArray(gallery)) {
      const productId = parseInt(id);

      await Gallery.deleteByProductId(productId);
      if (gallery.length > 0) {
        const galleryPromises = gallery.map((imgUrl: string, index: number) => {
          return Gallery.create({
            product_id: productId,
            image_url: imgUrl,
            sort_order: index,
          });
        });
        await Promise.all(galleryPromises);
      }
    }

    return res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- DELETE: Xóa sản phẩm ---
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const success = await Product.delete(id);

    if (!success) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    return res.json({ message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
