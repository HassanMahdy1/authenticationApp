import User from "../../models/userModel.js";
import AppError from "../../utils/appError.js";
export const deleteMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  user.active = false;
  await user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: "success",
    message: "Your account has been deactivated",
  });
};
