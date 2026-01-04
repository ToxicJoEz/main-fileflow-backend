import mongoose from "mongoose";

const BetaUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("BetaUser", BetaUserSchema);