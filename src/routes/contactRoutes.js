import express from "express";
import { submitContactForm, getContactSubmissions } from "../controllers/contactController.js";

const router = express.Router();

router.post("/contact", submitContactForm);
router.get("/contact", getContactSubmissions);

export default router;