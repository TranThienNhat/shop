import { Request, Response } from "express";
import Product, { ProductVariant } from "../models/ProductModel";
import Gallery from "../models/GalleryModel";

const createSlug = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const search = (req.query.search as string) || (req.query.keyword as string);
    const category_id = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;
    const brand_id = req.query.brand_id ? parseInt(req.query.brand_id as string) : undefined;
    const status = req.query.status as string;
    const min_price = req.query.min_price ? parseFloat(req.query.min_price as string) : undefined;
    const max_price = req.query.max_price ? parseFloat(req.query.max_price as string) : undefined;

    const where: any = {};
    if (status && status !== "all") where.status = status;
    else if (!status) where.status = "active";
    if (category_id) where.category_id = category_id;
    if (brand_id) where.brand_id = brand_id;

    const products = await Product.findAll({ where, search, minPrice: min_price, maxPrice: max_price, limit, offset, orderBy: "id", orderDir: "DESC" });
    const total = await Product.count({ where, search, minPrice: min_price, maxPrice: max_price });

    return res.json({ data: products, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await Product.findWithVariants(req.params.id);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const galleries = await Gallery.findAll({ where: { product_id: parseInt(req.params.id) }, orderBy: "sort_order", orderDir: "ASC" });
    return res.json({ message: "Lấy thông tin sản phẩm thành công", data: { ...product, galleries } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const showBySlug = async (req: Request, res: Response): Promise<Response> => {
  try {
    const product = await Product.findBySlugWithVariants(req.params.slug);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const galleries = await Gallery.findAll({ where: { product_id: product.id }, orderBy: "sort_order", orderDir: "ASC" });
    return res.json({ message: "Lấy thông tin sản phẩm thành công", data: { ...product, galleries } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const create = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { gallery, variants, ...productData } = req.body;

    if (!productData.name) {
      return res.status(400).json({ message: "Tên sản phẩm là bắt buộc" });
    }

    const slug = createSlug(productData.name) + "-" + Date.now();
    const newProductId = await Product.create({
      ...productData,
      slug,
      status: productData.status || "active",
    });

    // Tạo variants nếu có
    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        await ProductVariant.create({ ...v, product_id: newProductId });
      }
    } else {
      // Tạo variant mặc định nếu không có
      await ProductVariant.create({
        product_id: newProductId,
        variant_name: "Mặc định",
        price: productData.price || 0,
        stock_qty: productData.stock_qty || 0,
      });
    }

    if (gallery && Array.isArray(gallery) && gallery.length > 0) {
      await Promise.all(gallery.map((imgUrl: string, index: number) =>
        Gallery.create({ product_id: newProductId, image_url: imgUrl, sort_order: index })
      ));
    }

    return res.status(201).json({ message: "Tạo sản phẩm thành công", id: newProductId, slug });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({ message: "Lỗi khi tạo sản phẩm" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { gallery, variants, ...productData } = req.body;
    delete productData.id;
    delete productData.created_at;

    if (productData.name) {
      productData.slug = createSlug(productData.name) + "-" + id;
    }

    await Product.update(id, productData);

    // Cập nhật variants nếu có
    if (variants && Array.isArray(variants)) {
      await ProductVariant.deleteByProductId(parseInt(id));
      for (const v of variants) {
        await ProductVariant.create({ ...v, product_id: parseInt(id) });
      }
    }

    if (gallery && Array.isArray(gallery)) {
      await Gallery.deleteByProductId(parseInt(id));
      if (gallery.length > 0) {
        await Promise.all(gallery.map((imgUrl: string, index: number) =>
          Gallery.create({ product_id: parseInt(id), image_url: imgUrl, sort_order: index })
        ));
      }
    }

    return res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const success = await Product.delete(req.params.id);
    if (!success) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    return res.json({ message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
