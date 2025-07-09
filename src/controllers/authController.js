import User from "../models/User.js"; // Import the User model
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // Import jsonwebtoken for token generation

// Registration function (already exists)
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      plan: "free", // Default plan
      planStartDate: new Date(), // Set the start date to now
      paymentStatus: "unpaid", // Default payment status
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// New Login Function
export const loginUser = async (req, res) => {
  try {
    // Extract email and password from the request body
    const { email, password, redirect_uri } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether the email exists for security reasons
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // If credentials are valid, generate a JWT.
    // Make sure you have set a JWT_SECRET in your .env file.
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // The token will expire in 1 hour
    );

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

    // Return the token
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
