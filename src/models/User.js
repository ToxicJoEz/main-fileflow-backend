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

    // Password‑reset fields
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // 🔗 NEW: reference to the Plan collection
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    planStartDate: { type: Date, default: Date.now },
    planEndDate: { type: Date, default: null },

    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "expired"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
