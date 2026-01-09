import crypto from "crypto";
import User from "../../models/userModel.js";
import AppError from "../../utils/appError.js";

export const resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // 2) Find user by token and check if it hasn't expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 3) If token is invalid or has expired, send Error via AppError
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm; 
    
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // await user.save() will trigger Mongoose validators
    await user.save();

    // 5) Log the user in, send JWT
    res.status(200).json({
      status: "success",
      message: "Your password has been reset successfully!",
    });

  } catch (err) {
    next(err);
  }
};