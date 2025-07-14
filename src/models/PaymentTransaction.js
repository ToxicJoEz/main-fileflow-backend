// src/models/PaymentTransaction.js
import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    provider: {
      type: String,
      enum: ["stripe", "paypal", "paymob"],
      required: true,
    },
    providerTxnId: { type: String, required: true },
    amount: { type: Number, required: true }, // in USD cents or smallest unit
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model("PaymentTransaction", paymentTransactionSchema);
