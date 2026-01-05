import User from "../models/userModel.js";
import {
  getOne,
  updateOne,
  deleteOne,
  getAll,
} from "./handlerFactory.js";

export const getAllUser = getAll(User);
export const getUser = getOne(User, {
  path: "products",
});


export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);
