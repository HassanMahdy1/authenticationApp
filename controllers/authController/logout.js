import AppError from "./../../utils/appError.js";
import User from "./../../models/userModel.js";
import { promisify } from "util";
import jwt from "jsonwebtoken";
export const logout = async (req, res, next) => {
  try {
    const refreshTokenVal = req.cookies?.refreshToken;
    if (refreshTokenVal) {
      try {
        const decoded = await promisify(jwt.verify)(
          refreshTokenVal,
          process.env.REFRESH_TOKEN_SECRET
        );
        await User.findByIdAndUpdate(decoded.currentUser.id, {
          refreshToken: null,
        });
      } catch {
        // Token already invalid or expired
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ status: "success", message: "Logged out" });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
