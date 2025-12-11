// src/utils/generateToken.js

import jwt from "jsonwebtoken";
/**
 * Generates both an access and a refresh token for a user.
 * @param {object} user - The user object to generate tokens for.
 * @returns {{accessToken: string, refreshToken: string}}
 */
const generateTokens = (user) => {
  // Access token with a short expiration (e.g., 15 minutes)
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email }, // Payload for access token
    process.env.JWT_SECRET, // Secret for access token
    { expiresIn: "15m" } // Expiration time
  );
  // Refresh token with a longer expiration (e.g., 1 day)
  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "1d" });
  return { accessToken, refreshToken };
};

export default generateTokens;
