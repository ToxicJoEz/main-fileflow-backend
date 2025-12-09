// src/controllers/authController.js

import User from "../models/User.js";
import Plan from "../models/Plan.js"; // ← NEW
import bcrypt from "bcrypt";
import crypto from "crypto";
import transporter from "../config/emailTransporter.js";
import generateToken from "../utils/generateToken.js";
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
      paymentStatus: "unpaid",
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

    const token = generateToken(user);

    if (redirect_uri) {
      const allowedRedirects = [
        "http://localhost:5000/callback",
        "http://127.0.0.1:5000/callback",
      ];
      if (!allowedRedirects.includes(redirect_uri)) {
        return res.status(400).json({ message: "Invalid redirect URI" });
      }

      const encodedToken = encodeURIComponent(token);
      return res.status(200).json({
        token,
        redirect: `${redirect_uri}?token=${encodedToken}`,
      });
    }

    res.status(200).json({ token });
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

    // Version check
    const settings = await Setting.findOne({});
    if (!settings) {
      return res.status(500).json({ message: "Server settings not found." });
    }

    if (settings.forceUpdate && settings.latestVersion !== appVersion) {
      return res.status(426).json({
        message: "App update required",
        latestVersion: settings.latestVersion,
        downloadLink: "https://github.com/ToxicJoEz/FileFlow-User-App/releases/download/app/FileFlow.User.Application.3.rar", // replace with actual link
      });
    }

    const token = generateToken(user);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in loginAppUser:", error);
    res.status(500).json({ message: "Server error." });
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
