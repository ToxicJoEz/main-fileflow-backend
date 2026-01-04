import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Try port 465 (SSL) instead of 587
  secure: true, // Must be true for port 465
  family: 4, // Force IPv4 to prevent connection timeouts in cloud environments
  logger: true, // Enable logging to see detailed SMTP info
  debug: true, // Include SMTP traffic in the logs
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default transporter;
