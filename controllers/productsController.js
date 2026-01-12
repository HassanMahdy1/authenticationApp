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
  "category",
  "brand"
]);

export const getProduct = getOne(Product, [
  {
    path: "category",
    select: "name",
  },
  {
    path: "subCategory",
    select: "name",
  },
  {
    path: "brand",
    select: "name",
  },
  {
    path: "reviews",
  },
]);
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
