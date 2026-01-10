import AppError from "../../utils/appError.js";
import { promisify } from 'util';
import { jwt } from 'jsonwebtoken';
import User from "../../models/userModel.js";
import { accessToken } from './../../utils/jwt.js';

export const refresh = async (req, res, next) => {
  try {
    // 1) التأكد من وجود الكوكي
    const refreshTokenVal = req.cookies?.refreshToken;
    if (!refreshTokenVal) {
      return next(new AppError("UnAuthorized", 401));
    }

    // 2) التحقق من صحة التوكن
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(
        refreshTokenVal,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (err) {
      return next(new AppError("Forbidden: Invalid or expired token", 403));
    }

    // 3) البحث عن المستخدم
    const foundUser = await User.findById(decoded.currentUser.id).select(
      "+refreshToken"
    );
    if (!foundUser) {
      return next(new AppError("UnAuthorized: User not found", 401));
    }

    const isMatch = await foundUser.correctRefreshToken(
      refreshTokenVal,
      foundUser.refreshToken
    );

    if (!isMatch) {
      return next(new AppError("Invalid refresh token: Access Denied", 403));
    }

    const token = accessToken(foundUser._id);

    res.status(200).json({
      status: "success",
      accessToken: token,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
