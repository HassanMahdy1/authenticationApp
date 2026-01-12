import Category from "../models/categoryModel.js";
import {
  createOne,
  getOne,
  updateOne,
  deleteOne,
  getAll,
} from "./handlerFactory.js";

export const getAllCategory = getAll(Category);

export const getCategory = getOne(Category, [
  {
    path: "products",
  },
  {
    path: "subCategories",
  },
]);

export const createCategory = createOne(Category, [
  "name",
  "image",
  "isActive",
]);

export const updateCategory = updateOne(Category, [
  "name",
  "image",
  "isActive",
]);
export const deleteCategory = deleteOne(Category);
