import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import searchLogRoutes from "./routes/searchLog.js";

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes (placed early)
app.use(
  cors({
    origin: "*", // allow all domains
  })
);

// Connect to MongoDB using the connection string in .env (e.g., DB_URL)
const DB_URL = process.env.DB_URL;
mongoose
  .connect(DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mount the authentication routes at the root.
// Example: /register, /login, etc.
app.use("/", authRoutes);

// Mount the profile routes at the root so that, for example,
// a route defined as router.get('/profile', ...) in profileRouter
// is accessible via http://localhost:3000/profile.
app.use("/", profileRouter);

app.use("/", searchLogRoutes); // Add this under other routes

// A simple test route to ensure the server is running.
// This route will only be hit if no other route matches.
app.get("/", (req, res) => {
  res.send("Hello from FileFlow Backend!");
});

// Start the server on port 3000 or use the port defined in environment variables
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
