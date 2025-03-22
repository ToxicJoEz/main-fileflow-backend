const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Loads environment variables from .env

const authRoutes = require("./routes/auth");
const profileRouter = require("./routes/profile");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes (placed early)
app.use(cors());

// Connect to MongoDB using the connection string in .env (e.g., DB_URL)
const DB_URL = process.env.DB_URL;
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mount the authentication routes at the root.
// Example: /register, /login, etc.
app.use("/", authRoutes);

// Mount the profile routes at the root so that, for example, 
// a route defined as router.get('/profile', ...) in profileRouter 
// is accessible via http://localhost:3000/profile.
app.use("/", profileRouter);

// A simple test route to ensure the server is running.
// This route will only be hit if no other route matches.
app.get("/", (req, res) => {
  res.send("Hello from FileFlow Backend!");
});

// Start the server on port 3000 or use the port defined in environment variables
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
