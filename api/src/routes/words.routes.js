// src/routes/words.routes.js
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { generateWords } from "../controllers/words.controller.js";

export const wordsRouter = Router();

// GET /api/words?level=1
wordsRouter.get("/words", requireAuth, generateWords);