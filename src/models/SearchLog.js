import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema({
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
    type: [String], // Array of file names
    required: true,
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SearchLog", searchLogSchema);
