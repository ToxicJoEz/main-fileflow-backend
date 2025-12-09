import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  loginAppUser,
  resetPassword,
  getSettings
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login-app", loginAppUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/settings", getSettings);

export default router;
