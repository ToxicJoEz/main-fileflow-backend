// src/routes/profileRoutes.js

import express from "express";
import {
  getProfile,
  updateProfile,
  acceptPolicyAndTerms,
} from "../controllers/profileController.js";
import authenticateUser from "../middleware/authMiddleware.js";
import { body } from "express-validator";

const router = express.Router();

/**
 * Get Profile
 */
router.get("/profile", authenticateUser, getProfile);

/**
 * Update Profile
 */
router.patch(
  "/profile",
  authenticateUser,
  [
    body("username")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email address"),
  ],
  updateProfile
);

/**
 * Accept Policy and Terms
 */
router.patch(
  "/accept-policy",
  authenticateUser,
  [
    body("version")
      .notEmpty()
      .withMessage("Policy version is required")
      .isString()
      .withMessage("Policy version must be a string"),
  ],
  acceptPolicyAndTerms
);

export default router;