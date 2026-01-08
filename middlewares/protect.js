import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import { promisify } from "util";

export const verifyJWT = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new AppError("UnAuthorized", 401));
    }
    token = authHeader.split(" ")[1];
    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }
    // باستخدام promisify عشان نحولها لـ Promise
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const currentUser = await User.findById(decoded.currentUser.id);

    if (!currentUser) {
      return next(new AppError("User no longer exists", 401));
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("You are not logged in", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }
    next();
  };
};
