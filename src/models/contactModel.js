import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    business: {
      type: String,
      required: false,
    },
  },
  { timestamps: true, collection: "website user contact" }
);

export default mongoose.model("Contact", contactSchema);