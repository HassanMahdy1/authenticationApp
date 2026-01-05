import mongoose from "mongoose";
import slugify from "slugify";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique:[true,"the name must be unique"]
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

subCategorySchema.pre("save", function () {
  this.slug = slugify(this.name, { lower: true });
});
subCategorySchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
  }
});

subCategorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "subCategory",
});

export default mongoose.model("SubCategory", subCategorySchema);
