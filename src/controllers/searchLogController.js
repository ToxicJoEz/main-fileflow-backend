// src/controllers/searchLogController.js

import SearchLog from "../models/SearchLog.js";

/**
 * Log a keyword search
 */
export const logSearch = async (req, res) => {
  try {
    // Destructure the new, precise data structure from the request body
    const {
      keywords,
      totalMatchesFound,
      totalFilesSearched,
      totalKeywordsSearched,
      files,
    } = req.body;

    const userId = req.user.userId;

    // --- VALIDATION ---
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID is missing." });
    }

    // Validate the presence and type of the new fields
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ message: "Keywords array is missing or empty." });
    }
    if (typeof totalMatchesFound !== "number") {
      return res.status(400).json({ message: "totalMatchesFound must be a number." });
    }
    if (typeof totalFilesSearched !== "number") {
      return res.status(400).json({ message: "totalFilesSearched must be a number." });
    }
    if (typeof totalKeywordsSearched !== "number") {
      return res.status(400).json({ message: "totalKeywordsSearched must be a number." });
    }

    // Optional: Deeper validation to ensure files array has the correct structure
    if (files && Array.isArray(files)) {
      for (const file of files) {
        if (typeof file.total_matches !== 'number') {
          return res.status(400).json({ message: `File '${file.originalName}' is missing a valid 'total_matches' count.` });
        }
        if (file.matches && Array.isArray(file.matches)) {
          for (const match of file.matches) {
            if (!match.keyword) {
              return res.status(400).json({ message: `A match in file '${file.originalName}' is missing a 'keyword'.` });
            }
          }
        }
      }
    }


    // --- BUILD FINAL LOG OBJECT ---
    // The data structure from the body now directly matches the Mongoose model.
    const newLog = new SearchLog({
      userId,
      keywords,
      totalMatchesFound,
      totalFilesSearched,
      totalKeywordsSearched,
      files: files || [], // Use provided files or default to an empty array
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
