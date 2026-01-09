import User from "../../models/userModel.js";
import { sendEmail } from "../../services/email.js";
import AppError from "../../utils/appError.js"; // Assuming you use Jonas's AppError class

export const forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "There is no user with that email address.",
      });
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it via email
    // Note: If you are using a frontend like React, change this URL to your frontend route##########################################
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/resetPassword/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        resetURL,
        message: `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`,
      });

      res.status(200).json({
        status: "success",
        message:
          "A password reset link has been sent to your email address. Please check your inbox.",
      });
    } catch (err) {
      // If email sending fails, reset the fields in the DB
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error("Email Error:", err);
      return res.status(500).json({
        status: "error",
        message: "There was an error sending the email. Try again later!",
      });
    }
  } catch (error) {
    // Catching any unexpected DB errors
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
