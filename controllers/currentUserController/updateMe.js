import User from "../../models/userModel.js";
import filterObj from "../../utils/whiteListingFilterObjBody.js";
import AppError from './../../utils/appError.js';

export const updateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm || req.body.role) {
    return next(new AppError("This route is not for that updates.", 400));
  }

  const filteredBody = filterObj(req.body, "name", "email", "photo");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
  status: 'success',
  data: {
    user: updatedUser
  }
});

};
