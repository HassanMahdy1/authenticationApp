import mongoose from "mongoose";
import validator from "validator";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
      trim: true,
      maxlength: [40, "A user name must have less or equal than 40 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: { type: String, default: "default.jpg" },
    role: {
      type: String,
      enum: ["user", "guide", "lead-guide", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

// --- التحديثات الجديدة في الـ Hooks ---

// 1) تشفير الباسورد: في Mongoose الحديثة، الـ async hook ينتهي بمجرد اكتمال الـ Promise
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  // التشفير باستخدام bcrypt
  this.password = await bcrypt.hash(this.password, 12);

  // حذف الحقل المعلق
  this.passwordConfirm = undefined;
});

// 2) تحديث تاريخ التغيير: لا حاجة لـ next() طالما لا توجد عمليات async معقدة
userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

// 3) Middleware للبحث: يعمل بشكل طبيعي مع next
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

// --- Instance Methods ---

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
