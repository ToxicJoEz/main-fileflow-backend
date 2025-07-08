// routes/searchLog.js
const express = require("express");
const router = express.Router();
const SearchLog = require("../models/SearchLog");
const authenticateUser = require("../middleware/authMiddleware");

router.post("/log-search", authenticateUser, async (req, res) => {
  try {
    const { keyword, resultsCount, fileNames } = req.body;
    const userId = req.user.userId; // Securely get userId from JWT

    if (
      !keyword ||
      typeof resultsCount !== "number" ||
      !Array.isArray(fileNames)
    ) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const newLog = new SearchLog({
      userId,
      keyword,
      resultsCount,
      fileNames,
    });

    await newLog.save();

    res.status(201).json({ message: "Search log saved successfully." });
  } catch (error) {
    console.error("Error logging search:", error);
    res.status(500).json({ message: "Server error while logging search." });
  }
});

// GET search logs for the authenticated user
router.get("/search-logs", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;

    const logs = await SearchLog.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ logs });
  } catch (error) {
    console.error("Error fetching search logs:", error);
    res.status(500).json({ message: "Server error while fetching logs." });
  }
});

module.exports = router;
