// src/models/Plan.js
import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    // e.g. "free", "basic", "pro", "premium"
    name: {
      type: String,
      required: true,
      enum: ["free", "basic", "pro", "premium"],
      unique: true,
    },

    // Price in USD (free = 0)
    price: {
      type: Number,
      required: true,
      default: 0,
    },

    // Plan length in days (null → unlimited duration, used for “free”)
    durationDays: {
      type: Number,
      default: null,
    },

    // Marketing / feature list, can be filled later
    features: {
      type: [String],
      default: [],
    },

    // 🔗 Future payment‑provider product/price ID (Stripe, etc.)
    providerPriceId: {
      type: String,
      default: null,
    },

    // 🔢 Numeric usage limits (upload caps, storage, etc.)
    // Leave empty for now; add keys like { uploadsPerMonth: 100 }
    limits: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
