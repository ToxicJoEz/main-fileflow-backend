// src/models/Announcement.js
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    visibleToPlans: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
