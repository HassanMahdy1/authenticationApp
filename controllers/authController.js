import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import { accessToken, refreshToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";

const createSendToken = async (user, statusCode, res) => {
  const refresh = refreshToken(user._id);
  user.refreshToken = refresh;
  await user.save({ validateBeforeSave: false });
  res.cookie("refreshToken", refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(
      Date.now() + Number(process.env.REFRESH_TOKEN_EXP) * 24 * 60 * 60 * 1000
    ),
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token: accessToken(user._id),
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

export const refresh = (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return next(new AppError("UnAuthorized", 401));
  const refreshToken = cookies.refreshToken;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return next(new AppError("forbidden token", 403));
      const foundUser = await User.findById(decoded.currentUser.id).exec();
      if (!foundUser) return next(new AppError("UnAuthorized", 401));
      if (foundUser.refreshToken !== refreshToken)
        return next(new AppError("Invalid refresh token", 403));

      const token = accessToken(foundUser._id);
      res.json({ token });
    }
  );
};

export const logout = async (req, res) => {
  const cookies = req.cookies;
  if (cookies?.refreshToken) {
    const user = await User.findOne({ refreshToken: cookies.refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  res.status(200).json({ message: "Logged out" });
};

