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
        from: `"File Flow" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎉 Welcome to File Flow’s Beta Program!",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center;">
              <img src="https://i.imgur.com/6QDmneq.png" alt="File Flow Logo" style="max-width: 120px;">
            </div>
            <h2 style="color: #0073e6;">Hello ${name},</h2>
            <p>Thank you for signing up for <strong>File Flow’s Closed Beta</strong>! 🎉</p>
            <p>We’ve received your information and added you to our beta list.</p>
            <p>Our team will contact you shortly with more details on how to access the beta.</p>
            <p>If you have any questions, please feel free to reply to this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd;">
            <p style="text-align: center; font-size: 12px; color: #666;">
              © File Flow — More updates coming soon 🚀
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // user is still saved even if email fails
    }

    res.status(201).json({
      message:
        "Success! We have received your information. You will be contacted shortly with details on how to access the closed beta.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
