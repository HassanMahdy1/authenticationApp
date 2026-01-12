import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Review must have a rating"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// منع تكرار مراجعة نفس المستخدم لنفس المنتج
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/**
 * Static method لحساب متوسط التقييم وعدد المراجعات
 */
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 }, // عدد المراجعات
        avgRating: { $avg: "$rating" }, // متوسط التقييم
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5, // القيمة الافتراضية
    });
  }
};

/**
 * Middleware بعد إضافة مراجعة جديدة
 */
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.product);
});

/**
 * Middleware بعد تعديل أو حذف مراجعة
 */
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

// إنشاء نموذج Review
const Review = mongoose.model("Review", reviewSchema);

export default Review;
