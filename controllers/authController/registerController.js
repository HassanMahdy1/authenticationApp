import User from "../../models/userModel.js";
import AppError from "../../utils/appError.js";
import { createSendToken } from "./createSendToken.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, photo } = req.body;
    if (!name || !email || !password || !passwordConfirm) {
      return next(new AppError("All fields are required!", 400));
    }
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      photo,
    });

    createSendToken(newUser, 201, res, next);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
