import { Request, Response } from "express";
import Brand from "../models/BrandModel";
import { IBrand } from "../interfaces/Brand";
import { createSlug } from "../utils/slug";
import fs from "fs";
import path from "path";

const deleteFile = (filePath: string | undefined | null) => {
  if (!filePath) return;
  const cleanedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  const fullPath = path.join(process.cwd(), cleanedPath); 
  
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error("Lỗi xóa file vật lý:", err);
    });
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const brands = await Brand.findAll({ orderBy: "name", orderDir: "ASC" });
    return res.json({ message: "Thành công", data: brands });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const create = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, slug, description } = req.body;
    
    if (!name) return res.status(400).json({ message: "Tên thương hiệu là bắt buộc" });

    const finalSlug = slug || createSlug(name);
    const exists = await Brand.findOne({ slug: finalSlug });
    
    if (exists) {
      if (req.file) deleteFile(`uploads/brands/${req.file.filename}`);
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }

    const image_url = req.file ? `/uploads/brands/${req.file.filename}` : undefined;

    const newId = await Brand.create({
      name,
      slug: finalSlug,
      description,
      image_url
    });

    return res.status(201).json({ message: "Tạo thành công", id: newId, image_url });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const currentBrand = await Brand.findById(id);
    if (!currentBrand) {
      if (req.file) deleteFile(`uploads/brands/${req.file.filename}`);
      return res.status(404).json({ message: "Không tìm thấy" });
    }

    const dataToUpdate: Partial<IBrand> = {
      name,
      slug: slug || (name ? createSlug(name) : currentBrand.slug),
      description
    };

    if (req.file) {
      dataToUpdate.image_url = `/uploads/brands/${req.file.filename}`;
      if (currentBrand.image_url) {
        deleteFile(currentBrand.image_url);
      }
    }

    await Brand.update(id, dataToUpdate);
    return res.json({ message: "Cập nhật thành công", image_url: dataToUpdate.image_url });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);
    
    if (!brand) return res.status(404).json({ message: "Không tìm thấy" });

    const success = await Brand.delete(id);
    if (success) {
      if (brand.image_url) deleteFile(brand.image_url);
      return res.json({ message: "Xóa thành công" });
    }
    return res.status(400).json({ message: "Xóa thất bại" });
  } catch (error) {
    return res.status(400).json({ message: "Thương hiệu đang có sản phẩm, không thể xóa" });
  }
};