import Contact from "../models/contactModel.js";

const submitContactForm = async (req, res) => {
  try {
    const { name, email, message, phone, business } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email, and message are required." });
    }

    const newContact = new Contact({
      name,
      email,
      message,
      phone,
      business,
    });

    await newContact.save();
    res.status(201).json({ message: "Message received successfully." });
  } catch (error) {
    console.error("Error in submitContactForm:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getContactSubmissions = async (req, res) => {
  try {
    // Fetch all documents and sort by creation date, newest first
    const submissions = await Contact.find({}).sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export {
    submitContactForm,
    getContactSubmissions
};