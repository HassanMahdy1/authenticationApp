import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";




export const verfyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("UnAuthorized", 401));
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return next(new AppError("forbidden token", 403));
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
  });
};



export const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log("restric###");
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(new AppError("you dont have permission", 403));
    }
    next();
  };
};
