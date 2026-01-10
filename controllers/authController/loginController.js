import User from "../../models/userModel.js";
import AppError from "../../utils/appError.js";
import { createSendToken } from './createSendToken.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide email and password!", 400));
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }
    createSendToken(user, 200, res, next);
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};