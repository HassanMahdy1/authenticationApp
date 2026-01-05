import SubCategory from "../models/subCategoryModel.js";
import {
  createOne,
  getOne,
  updateOne,
  deleteOne,
  getAll,
} from "./handlerFactory.js";

export const getAllSubCategory = getAll(SubCategory);
export const getSubCategory = getOne(SubCategory, {
  path: "products",
});

export const createSubCategory = createOne(SubCategory, ["name", "isActive","category"]);

export const updateSubCategory = updateOne(SubCategory, ["name", "isActive","category"]);
export const deleteSubCategory = deleteOne(SubCategory);
