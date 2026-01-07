import { Request, Response } from "express";
import Category from "../models/CategoryModel";
import { ICategory } from "../interfaces/Category";
import { createSlug } from "../utils/slug";

// --- GET ALL (Có thể làm dạng cây, nhưng ở đây làm list phẳng trước) ---
export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const categories = await Category.findAll({
      orderBy: "id",
      orderDir: "ASC",
    });

    return res.json({
      message: "Lấy danh sách danh mục thành công",
      data: categories,
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
    const { name, parent_id, image_url, description } = req.body as ICategory;

    console.log("Creating category with data:", {
      name,
      parent_id,
      image_url,
      description,
    });

    if (!name)
      return res.status(400).json({ message: "Tên danh mục là bắt buộc" });

    const slug = createSlug(name);
    console.log("Generated slug:", slug);

    const exists = await Category.findOne({ slug });
    if (exists) {
      console.log("Category already exists:", exists);
      return res.status(409).json({ message: "Danh mục đã tồn tại" });
    }

    const newId = await Category.create({
      name,
      slug,
      parent_id: parent_id || null,
      image_url,
      description,
    });

    console.log("Created category with ID:", newId);

    return res
      .status(201)
      .json({ message: "Tạo danh mục thành công", id: newId });
  } catch (error) {
    console.error("Error creating category:", error);
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
    const { name, parent_id, image_url, description } = req.body as ICategory;

    if (parent_id && Number(parent_id) === Number(id)) {
      return res
        .status(400)
        .json({ message: "Danh mục không thể là cha của chính nó" });
    }

    const dataToUpdate: Partial<ICategory> = {
      parent_id: parent_id || null,
      image_url,
      description,
    };

    if (name) {
      dataToUpdate.name = name;
      dataToUpdate.slug = createSlug(name);
    }

    const success = await Category.update(id, dataToUpdate);
    if (!success)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });

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

    const children = await Category.count({ parent_id: Number(id) });
    if (children > 0) {
      return res.status(400).json({ message: "Phải xóa danh mục con trước" });
    }

    const success = await Category.delete(id);
    if (!success)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });

    return res.json({ message: "Xóa thành công" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Không thể xóa danh mục đang chứa sản phẩm" });
  }
};
