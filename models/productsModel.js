import mongoose from "mongoose";
import slugify from "slugify";


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
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
    images: [
      {
        type: String, // image URLs
        required: true,
      },
    ],
    size: {
      type: String,
    },
    discount: {
      type: Number, // percentage
      default: 0,
    },

    ratingsAverage: {
      type: Number,
      default: 0,
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
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
  },
  {
    timestamps: true, // يقوم بإنشاء createdAt و updatedAt تلقائيًا
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

productSchema.pre(/^find/, function () {
  this.populate({ path: "category", select: "name" });
});

const Product = mongoose.model("Product", productSchema);
export default Product;
