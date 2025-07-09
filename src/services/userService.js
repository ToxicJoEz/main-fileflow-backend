// src/services/userService.js

import User from "../models/User.js";

/**
 * Get user profile by ID (excluding password)
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found.");
  }
  return user;
};

/**
 * Update user profile by ID
 */
export const updateUserById = async (userId, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");

  if (!updatedUser) {
    throw new Error("User not found.");
  }

  return updatedUser;
};
