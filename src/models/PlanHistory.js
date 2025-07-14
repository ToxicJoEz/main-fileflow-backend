// src/models/PlanHistory.js
import mongoose from "mongoose";

const planHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    toPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    method: {
      type: String,
      enum: ["manual", "paymob", "admin"],
      default: "manual",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model("PlanHistory", planHistorySchema);
