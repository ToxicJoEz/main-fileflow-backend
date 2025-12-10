// src/app.js

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Global middleware
app.use(cors());
// Increase payload size limit to handle large search logs
// The default is '100kb', which is too small.
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

// Root route (for testing)
app.get("/", (req, res) => {
  res.send("Hello from FileFlow Backend!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
