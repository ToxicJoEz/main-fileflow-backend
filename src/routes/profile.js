import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    // Use the userId from the token (attached by your middleware)
    const user = await User.findById(req.user.userId).select("-password"); // Exclude the password field
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({
      message: "Profile information",
      user: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// PATCH endpoint to update the user's profile
router.patch(
  "/profile",
  authenticateToken,
  [
    // Validation rules for optional fields
    body("username")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email address"),
    // You can add more validators for additional fields as needed
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get the user ID from the token (assumed to be in req.user.userId)
      const userId = req.user.userId;
      // The fields to update come from the request body
      const updateData = req.body;

      // Update the user document; { new: true } returns the updated document
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

export default router;
