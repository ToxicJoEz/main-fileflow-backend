// src/controllers/profileController.js

import User from "../models/User.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

/**
 * Get the logged-in user's profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("plan");

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
      .populate("plan");

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

/**
 * Accept latest Policy and Terms
 */
export const acceptPolicyAndTerms = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { version } = req.body;

    if (!version) {
      return res.status(400).json({
        message: "Policy version is required.",
      });
    }

    // Get Settings collection directly via mongoose
    const settingsCollection = mongoose.connection.collection("settings");
    const settings = await settingsCollection.findOne({});

    if (!settings) {
      return res.status(500).json({
        message: "Settings configuration not found.",
      });
    }

    const latestPolicyVersion = settings.latestPolicyVersion;

    // Compare versions
    if (version !== latestPolicyVersion) {
      return res.status(400).json({
        message: `The version you are trying to accept (${version}) is outdated. Latest version is ${latestPolicyVersion}. Please refresh and try again.`,
      });
    }

    // Update user terms
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        "terms.accepted": true,
        "terms.version": latestPolicyVersion,
        "terms.acceptedAt": new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Return only success message and version
    return res.status(200).json({
      message: "Policy and Terms accepted successfully.",
      version: latestPolicyVersion,
    });
  } catch (error) {
    console.error("Error in acceptPolicyAndTerms:", error);
    return res.status(500).json({
      message: "Server error.",
    });
  }
};