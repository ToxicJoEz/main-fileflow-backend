const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const crypto = require("crypto"); // built-in module to generate a secure token
const bcrypt = require("bcrypt");

const User = require("../models/User"); // you already have this model
const transporter = require("../config/emailTransporter"); // we'll make this next

// Registration endpoint
router.post("/register", registerUser);

// Login endpoint
router.post("/login", loginUser);

// forgot password endpoint
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body; // Get the email from frontend form

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if user with that email exists
    const user = await User.findOne({ email });

    if (!user) {
      // We return the same message either way to not expose email existence
      return res
        .status(200)
        .json({ message: "If the email exists, a reset link will be sent." });
    }

    // Generate a random token using built-in crypto
    const token = crypto.randomBytes(32).toString("hex");

    // Set token and expiry on the user model (1 hour from now)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Build the link that goes in the email
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    // Email content
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

    // Send the email using nodemailer
    await transporter.sendMail(mailOptions);

    // Always return success message (whether user exists or not)
    res
      .status(200)
      .json({ message: "If the email exists, a reset link will be sent." });
  } catch (err) {
    console.error("Error in /forgot-password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  try {
    // Find the user with that reset token and check if it hasn’t expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Save the new password + clear the reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
