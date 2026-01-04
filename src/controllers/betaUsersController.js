import BetaUser from "../models/betaUser.js";
import transporter from "../config/emailTransporter.js";

export const simpleController = async (req, res) => {
  try {
    const { name, email } = req.body;

    const existingUser = await BetaUser.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new BetaUser({ name, email });
    await newUser.save();

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "🎉 Welcome to File Flow’s Beta Program!",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center;">
            <img src="https://i.imgur.com/6QDmneq.png" alt="File Flow Logo" style="max-width: 120px;">
          </div>
          <h2 style="color: #0073e6;">Hello ${name},</h2>
          <p>Thank you for signing up for <strong>File Flow’s Closed Beta</strong>! 🎉</p>
          <p>We’re excited to have you as one of the first testers of our cutting-edge file management platform.</p>
          <p>Our team will reach out soon with more details on how to access the beta and start exploring.</p>
          <p>Meanwhile, if you have any questions, feel free to reply to this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd;">
          <p style="text-align: center; font-size: 12px; color: #666;">🌐 Stay tuned for more updates soon!</p>
        </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(201).json({ message: "Beta user saved and email sent successfully" });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      res.status(201).json({ message: "Beta user saved successfully, but confirmation email failed to send." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};