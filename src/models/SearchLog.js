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

    // Summary counts from the search operation
    totalMatchesFound: {
      type: Number,
      required: true,
    },
    totalFilesSearched: {
      type: Number,
      required: true,
    },
    totalKeywordsSearched: {
      type: Number,
      required: true,
    },

    // Detailed results per file
    files: [
      {
        fileName: { type: String },
        total_matches: { type: Number, required: true },
        originalName: { type: String }, // From multer
        storedName: { type: String }, // From multer
        
        // Each individual match found in the file
        matches: [
          {
            line: { type: String },
            line_number: { type: mongoose.Schema.Types.Mixed }, // Can be number or string, but is now optional
            match_start: { type: Number },
            match_end: { type: Number },
            keyword: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SearchLog", searchLogSchema);
