import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    image: {
      type: String, // banner / ads image
    },
    isActive: {
      type: Boolean,
      default: true,
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

categorySchema.pre("save", function () {
  this.slug = slugify(this.name, { lower: true });
});
categorySchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
  }
});

categorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
});

export default mongoose.model("Category", categorySchema);
