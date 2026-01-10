import User from "../../models/userModel.js";
import AppError from "../../utils/appError.js";
import { createSendToken } from "../authController/createSendToken.js";

export const updatePassword = async (req, res, next) => {
    
  if (
    !req.body.passwordCurrent ||
    !req.body.password ||
    !req.body.passwordConfirm
  ) {
    return next(
      new AppError("Please provide current password and new password", 400)
    );
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
};
