import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      minlength: [3, "Your name must be at least 3 characters"],
      maxlength: [30, "Your name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [8, "Your password must be at least 8 characters"],
      select: false,
    },
    resetPasswordOtp: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Encrypting password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
});

// JWT token

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// // Generate password reset token

// userSchema.methods.getResetPasswordToken = function () {
//   // Generate token
//   const resetToken = crypto.randomBytes(20).toString("hex");

//   // Hash and set to resetPasswordToken
//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   // Set token expire time
//   this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

//   return resetToken;
// };

const User = mongoose.model("User", userSchema);
export default User;
