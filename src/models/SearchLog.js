// src/models/SearchLog.js

import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // All keywords searched in this operation
    keywords: [
      {
        type: String,
        required: true,
      },
    ],

    // Total matches across all keywords & files
    totalMatches: {
      type: Number,
      required: true,
    },

    // Per-file, per-keyword result details
    files: [
      {
        fileName: { type: String, required: true },

        matches: [
          {
            keyword: { type: String, required: true },
            count: { type: Number, required: true },

            // Occurrences like "found on page 3 with context..."
            occurrences: [
              {
                page: { type: Number },
                context: { type: String }, // supports highlighted text
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SearchLog", searchLogSchema);
