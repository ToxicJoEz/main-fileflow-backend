// src/controllers/searchLogController.js

import SearchLog from "../models/SearchLog.js";

/**
 * Log a keyword search
 */
export const logSearch = async (req, res) => {
  try {
    const {
      keyword,          // OLD (single keyword)
      keywords,         // NEW (array of keywords)
      resultsCount,     // OLD (total matches)
      totalMatches,     // NEW (total matches)
      fileNames,        // OLD (simple array of file names)
      files             // NEW (detailed per-file match data)
    } = req.body;

    const userId = req.user.userId;

    // --- VALIDATION ---
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // Accept either "keyword" OR "keywords"
    if (!keyword && (!keywords || !Array.isArray(keywords))) {
      return res.status(400).json({ message: "Keyword(s) missing." });
    }

    // Accept either "resultsCount" OR "totalMatches"
    const matchCount = typeof totalMatches === "number" ? totalMatches : resultsCount;

    if (typeof matchCount !== "number") {
      return res.status(400).json({ message: "Invalid match count." });
    }

    // Accept old "fileNames" or new "files" structure
    const fileData =
      Array.isArray(files) && files.length > 0
        ? files
        : fileNames?.map((name) => ({
            fileName: name,
            matches: [], // old system had no detailed matches
          })) || [];

    // --- BUILD FINAL LOG OBJECT ---
    const newLog = new SearchLog({
      userId,

      // NEW system → use array
      keywords: Array.isArray(keywords)
        ? keywords
        : keyword
        ? [keyword]
        : [],

      // NEW totalMatches
      totalMatches: matchCount,

      // NEW file structure
      files: fileData,

      // OLD fallback fields (kept to avoid breaking frontend)
      keyword: keyword || null,
      resultsCount: matchCount,
      fileNames: fileNames || [],
    });

    await newLog.save();

    res.status(201).json({
      message: "Search log saved successfully.",
    });
  } catch (error) {
    console.error("Error logging search:", error);
    res.status(500).json({ message: "Server error while logging search." });
  }
};

/**
 * Get search logs for authenticated user
 */
export const getSearchLogs = async (req, res) => {
  try {
    const userId = req.user.userId;

    const logs = await SearchLog.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ logs });
  } catch (error) {
    console.error("Error fetching search logs:", error);
    res.status(500).json({ message: "Server error while fetching logs." });
  }
};
