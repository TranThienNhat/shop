import { Request, Response } from "express";
import Brand from "../models/BrandModel";
import { IBrand } from "../interfaces/Brand";
import { createSlug } from "../utils/slug";

// --- GET ALL ---
export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const brands = await Brand.findAll({ orderBy: "name", orderDir: "ASC" });
    return res.json({
      message: "Lấy danh sách thương hiệu thành công",
      data: brands,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- CREATE ---
export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, image_url, description } = req.body as IBrand;

    if (!name)
      return res.status(400).json({ message: "Tên thương hiệu là bắt buộc" });

    const slug = createSlug(name);

    const exists = await Brand.findOne({ slug });
    if (exists)
      return res.status(409).json({ message: "Thương hiệu đã tồn tại" });

    const newId = await Brand.create({ name, slug, image_url, description });

    return res
      .status(201)
      .json({ message: "Tạo thương hiệu thành công", id: newId });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- UPDATE ---
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, image_url, description } = req.body as IBrand;

    const dataToUpdate: Partial<IBrand> = { image_url, description };

    if (name) {
      dataToUpdate.name = name;
      dataToUpdate.slug = createSlug(name);
    }

    const success = await Brand.update(id, dataToUpdate);
    if (!success)
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

    return res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// --- DELETE ---
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const success = await Brand.delete(id);
    if (!success)
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

    return res.json({ message: "Xóa thành công" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Không thể xóa thương hiệu đang có sản phẩm" });
  }
};
