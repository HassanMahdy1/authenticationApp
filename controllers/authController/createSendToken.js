import User from "../../models/userModel.js";
import AppError from "../../utils/appError.js";
import { accessToken, refreshToken } from "./../../utils/jwt.js";
import bcrypt from "bcryptjs";
export const createSendToken = async (user, statusCode, res, next) => {
  try {
    const refresh = refreshToken(user._id);
    const access = accessToken(user._id);
    const hashedRefresh = await bcrypt.hash(refresh, 10);
    await User.findByIdAndUpdate(user._id, { refreshToken: hashedRefresh });

    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(
        Date.now() + Number(process.env.REFRESH_TOKEN_EXP) * 24 * 60 * 60 * 1000
      ),
    });
    user.password = undefined;
    user.refreshToken = undefined;
    res.status(statusCode).json({
      status: "success",
      accessToken: access,
      data: {
        user,
      },
    });
  } catch (error) {
    return next(new AppError("Error generating tokens", 500));
  }
};
