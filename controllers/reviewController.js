import Review from "../models/reviewModel.js";
import AppError from "../utils/appError.js";
import { getOne, updateOne, deleteOne, getAll } from "./handlerFactory.js";

export const getAllReview = getAll(Review);
export const getReview = getOne(Review, [
  { path: "product", select: "name" },
  { path: "user", select: "name photo" },
]);

export const createReview = async (req, res, next) => {
  try {
    if (!req.body.product) {
      req.body.product = req.params.productId;
    }
    if (!req.body.user) {
      req.body.user = req.user.id;
    }
    const { review, rating, user, product } = req.body;
    const newReview = await Review.create({ review, rating, user, product });
    res.status(201).json({
      status: "success",
      data: {
        review: newReview,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { review, rating } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid ID format", 400));
    }

    // جلب المراجعة أولاً
    const existingReview = await Review.findById(id);

    if (!existingReview) {
      return next(new AppError("No review found with that ID", 404));
    }

    // التحقق من أن المستخدم الحالي هو صاحب المراجعة
    if (existingReview.user.toString() !== req.user.id) {
      return next(
        new AppError("You are not allowed to update this review", 403)
      );
    }

    // تحديث المراجعة
    existingReview.review = review || existingReview.review;
    existingReview.rating = rating || existingReview.rating;

    await existingReview.save(); // سيُفعل post save middleware لتحديث المتوسط

    res.status(200).json({
      status: "success",
      data: existingReview,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // التحقق من صحة الـ ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid ID format", 400));
    }

    // جلب المستند أولاً
    const review = await Review.findById(id);

    if (!review) {
      return next(new AppError("No review found with that ID", 404));
    }

    // التحقق من أن المستخدم الحالي هو صاحب المراجعة
    if (
      review.user.toString() !== req.user.id &&
      req.user.role !== "moderator"
    ) {
      return next(
        new AppError("You are not allowed to delete this review", 403)
      );
    }

    // إذا كل شيء صحيح، احذف المراجعة
    await Review.findByIdAndDelete(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
