import Brand from "../models/brandModel.js";
import {
  createOne,
  getOne,
  updateOne,
  deleteOne,
  getAll,
} from "./handlerFactory.js";

export const getAllBrand = getAll(Brand);
export const getBrand = getOne(Brand, {
  path: "products",
  select: "-category",
});

export const createBrand = createOne(Brand, ["name", "logo"]);

export const updateBrand = updateOne(Brand, ["name", "logo"]);
export const deleteBrand = deleteOne(Brand);
