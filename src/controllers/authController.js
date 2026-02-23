// src/controllers/authController.js

import User from "../models/User.js";
import Plan from "../models/Plan.js"; // ← NEW
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import transporter from "../config/emailTransporter.js"; 
import generateTokens from "../utils/generateToken.js";
import Setting from "../models/Setting.js";

/* ------------------------------------------------------------------ */
/* Register                                                          */
/* ------------------------------------------------------------------ */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    if (await User.findOne({ username })) {
      return res.status(409).json({ message: "Username already exists." });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "Email already exists." });
    }

    /* 1️⃣ Lookup “free” plan ID */
    const freePlan = await Plan.findOne({ name: "free" });
    if (!freePlan) {
      return res.status(500).json({ message: "Free plan not found." });
    }

    /* 2️⃣ Create user linked to that plan */
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      plan: freePlan._id, // ObjectId reference
      planStartDate: new Date(),
      planEndDate: null,
      isActive: true, // Explicitly set to active on registration
      paymentStatus: "active",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/* ------------------------------------------------------------------ */
/* Login                                                              */
/* ------------------------------------------------------------------ */
export const loginUser = async (req, res) => {
  try {
    const { email, password, redirect_uri } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    const { accessToken, refreshToken } = generateTokens(user);

    if (redirect_uri) {
      const allowedRedirects = [
        "http://localhost:5000/callback",
        "http://127.0.0.1:5000/callback",
      ];
      if (!allowedRedirects.includes(redirect_uri)) { 
        return res.status(400).json({ message: "Invalid redirect URI" });
      }

      const encodedToken = encodeURIComponent(accessToken);
      return res.status(200).json({
        accessToken,
        refreshToken,
        redirect: `${redirect_uri}?token=${encodedToken}`,
      });
    }

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/* ------------------------------------------------------------------ */
/* App Login                                                          */
/* ------------------------------------------------------------------ */
export const loginAppUser = async (req, res) => {
  try {
    const { email, password, appVersion } = req.body;

    if (!email || !password || !appVersion) {
      return res
        .status(400)
        .json({ message: "Email, password, and appVersion are required." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    // Check the user's active status
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is deactivated." });
    }

    // Handle cases where the status isn't explicitly set (e.g., older user documents)
    if (typeof user.isActive === "undefined") {
      return res.status(403).json({
        message: "Account status is unverified. Please contact support.",
      });
    }

    // Get settings
    const settings = await Setting.findOne({});
    if (!settings) {
      return res.status(500).json({ message: "Server settings not found." });
    }

    // App version check
    if (settings.forceUpdate && settings.latestVersion !== appVersion) {
      return res.status(426).json({
        message: "App update required",
        latestVersion: settings.latestVersion,
        downloadLink:
          "https://github.com/ToxicJoEz/FileFlow-User-App/releases/download/app/FileFlow.User.Application.0.1.0.rar",
      });
    }

    // 🔹 Policy version check (NEW)
    const latestPolicyVersion = settings.latestPolicyVersion;
    const mustAcceptPolicy =
      !user.terms?.version ||
      user.terms.version !== latestPolicyVersion;

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken,
      mustAcceptPolicy,
    });
  } catch (error) {
    console.error("Error in loginAppUser:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/* ------------------------------------------------------------------ */
/* Refresh Access Token                                               */
/* ------------------------------------------------------------------ */
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required." });
  }

  try {
    // 1. Verify the refresh token using its specific secret
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 2. Find the user from the token's payload
    const user = await User.findById(decoded.userId);

    if (!user) {
      // This could happen if the user was deleted after the token was issued
      return res
        .status(403)
        .json({ message: "Invalid refresh token. User not found." });
    }

    // 3. Generate a new access token (but not a new refresh token)
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    // Handle specific JWT errors for better client-side logic
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token. Please log in again." });
  }
};

/* ------------------------------------------------------------------ */
/* Forgot Password                                                    */
/* ------------------------------------------------------------------ */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "If the email exists, a reset link will be sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `https://file-flow-front-end.vercel.app/reset-password?token=${token}`;
    const mailOptions = {
      from: "youssef_aast2007@yahoo.com",
      to: user.email,
      subject: "Password Reset for File Flow",
      html: `
        <p>Hello ${user.username},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ message: "If the email exists, a reset link will be sent." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ------------------------------------------------------------------ */
/* Reset Password                                                     */
/* ------------------------------------------------------------------ */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res
      .status(400)
      .json({ message: "Token and new password are required" });

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ------------------------------------------------------------------ */
/* Get current app settings                                           */
/* ------------------------------------------------------------------ */
export const getSettings = async (req, res) => {
  try {
    // Assuming i only have one settings document
    const settings = await Setting.findOne({});
    if (!settings) {
      return res.status(404).json({ message: "Settings not found." });
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Server error" });
  }
};
