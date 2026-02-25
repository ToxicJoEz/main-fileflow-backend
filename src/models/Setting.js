// src/models/Setting.js
import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    latestVersion: { type: String, required: true },
    latestPolicyVersion: { type: String, required: true }, // ← added
    forceUpdate: { type: Boolean, default: false },
    releaseNotes: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema, "settings"); // ensure collection name