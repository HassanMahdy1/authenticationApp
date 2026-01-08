import Product from "../models/productsModel.js";
import {
  createOne,
  getOne,
  updateOne,
  deleteOne,
  getAll,
} from "../controllers/handlerFactory.js";

export const getAllProduct = getAll(Product);

export const createProduct = createOne(Product, [
  "name",
  "price",
  "description",
  "stock",
  "images",
  "size",
  "discount",
  "isAvailable",
  "subCategory",
  "category"
]);

export const getProduct = getOne(Product, {
  path: "category",
  select: "name",
});
export const updateProduct = updateOne(Product, [
  "name",
  "price",
  "description",
  "stock",
  "images",
  "size",
  "discount",
  "isAvailable",
]);
export const deleteProduct = deleteOne(Product);
