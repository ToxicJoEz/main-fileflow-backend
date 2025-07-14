// src/models/SupportTicket.js
import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "pending", "closed"],
      default: "open",
    },
    adminReply: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);
