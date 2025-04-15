const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true, // Ensure no duplicate usernames
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Ensure no duplicate emails
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatar: {
      type: String,
      default: "https://i.imgur.com/MeX4eoc.png",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
