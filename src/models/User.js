// src/models/User.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
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
    planStartDate: Date,
    planEndDate: Date,
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "expired"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
