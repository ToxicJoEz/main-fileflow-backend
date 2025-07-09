// src/routes/profileRoutes.js

import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import authenticateUser from "../middleware/authMiddleware.js";
import { body } from "express-validator";

const router = express.Router();

router.get("/profile", authenticateUser, getProfile);

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

export default router;
