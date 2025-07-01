const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true, // Ensure no duplicate usernames
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Ensure no duplicate emails
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatar: {
      type: String,
      default: "https://i.imgur.com/4OfYHou.png",
      trim: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "plus", "premium"],
      default: "free",
    },
    planStartDate: {
      type: Date,
    },
    planEndDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "expired"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
