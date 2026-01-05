import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import { accessToken, refreshToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import bcrypt from "bcryptjs";

const createSendToken = async (user, statusCode, res) => {
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
};
//3###########################################################################################
export const register = async (req, res, next) => {
  const { name, email, password, passwordConfirm, photo } = req.body;
  if (!name || !email || !password || !passwordConfirm)
    return next(new AppError("all feilds are required!"));
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    photo,
  });

  createSendToken(newUser, 201, res);
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(user, 200, res);
};

export const refresh = async (req, res, next) => {
  // 1) التأكد من وجود الكوكي
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return next(new AppError("UnAuthorized", 401));

  // 2) التحقق من صحة التوكن (بأسلوب الـ Promises الحديث)
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (err) {
    return next(new AppError("Forbidden: Invalid or expired token", 403));
  }

  // 3) البحث عن المستخدم وجلب التوكن المشفر (select: +refreshToken)
  const foundUser = await User.findById(decoded.currentUser.id).select(
    "+refreshToken"
  );
  if (!foundUser)
    return next(new AppError("UnAuthorized: User not found", 401));

  const isMatch = await foundUser.correctRefreshToken(
    refreshToken,
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
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    try {
      const decoded = await promisify(jwt.verify)(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      console.log(decoded);
      await User.findByIdAndUpdate(decoded.currentUser.id, {
        refreshToken: null,
      });
    } catch {
      console.log("Logout cleanup: Token already invalid or expired");
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ status: "success", message: "Logged out" });
};
