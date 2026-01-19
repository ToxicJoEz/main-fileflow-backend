// src/app.js

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config"; // Load environment variables

// Route imports
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import betaRoutes from "./routes/betaUsersRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

// Create express app
const app = express();

// Global middleware
app.use(cors());
// Increase payload size limit to handle large search logs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Use route handlers
app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", searchRoutes);
app.use("/", betaRoutes);
app.use("/", contactRoutes);

// Root route (for testing)
app.get("/", (req, res) => {
  res.send("Hello from FileFlow Backend!");
});

// Start server — Railway requires this exact setup
const PORT = process.env.PORT;
if (!PORT) {
  console.error("❌ PORT is not set. Railway injects this automatically.");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
