// src/controllers/profileController.js

import User from "../models/User.js";
import { validationResult } from "express-validator";

/**
 * Get the logged-in user's profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("plan"); // Populate full plan details

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile information",
      user,
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * Update the logged-in user's profile
 */
export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    })
      .select("-password")
      .populate("plan"); // Also populate after update

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Server error." });
  }
};
