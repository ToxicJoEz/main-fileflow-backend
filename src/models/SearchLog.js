// src/models/SearchLog.js

import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    keyword: {
      type: String,
      required: true,
    },
    resultsCount: {
      type: Number,
      required: true,
    },
    fileNames: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

export default mongoose.model("SearchLog", searchLogSchema);
