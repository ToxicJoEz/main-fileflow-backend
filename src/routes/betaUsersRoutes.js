import express from "express";
import {simpleController} from "../controllers/betaUsersController.js";

const router = express.Router();

router.post("/beta-signup", simpleController);

export default router;
