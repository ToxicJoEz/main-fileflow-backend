import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    latestVersion: { type: String, required: true },
    forceUpdate: { type: Boolean, default: false },
    releaseNotes: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
