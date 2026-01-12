import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: [true, "Product name must be unique"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      validate: [(v) => v.length > 0, "Product must have at least one image"],
    },
    size: {
      type: String,
    },
    discount: {
      type: Number, // percentage
      default: 0,
    },

    ratingsAverage: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.1,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "Product must belong to a sub-category"],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

productSchema.pre("save", function () {
  this.slug = slugify(this.name, { lower: true });
});
productSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
  }
});

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
  //  مودل اسمه ريفيو داخله حقل اسمه برودكت الايدي بتاعه بقا
});
const Product = mongoose.model("Product", productSchema);
export default Product;
