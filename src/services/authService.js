// src/services/authService.js

import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Register a new user
 */
export const register = async ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw new Error("Username, email, and password are required.");
  }

  const existingUserByUsername = await User.findOne({ username });
  if (existingUserByUsername) {
    throw new Error("Username already exists.");
  }

  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    throw new Error("Email already exists.");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    plan: "free",
    planStartDate: new Date(),
    paymentStatus: "unpaid",
  });

  await newUser.save();

  return { message: "User registered successfully." };
};

/**
 * Log in a user
 */
export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials.");
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { token };
};
