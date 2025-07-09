// src/routes/searchRoutes.js

import express from "express";
import {
  logSearch,
  getSearchLogs,
} from "../controllers/searchLogController.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/log-search", authenticateUser, logSearch);
router.get("/search-logs", authenticateUser, getSearchLogs);

export default router;
