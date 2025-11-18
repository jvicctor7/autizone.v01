// src/routes/words.routes.js
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { generateWords, listSavedWords, debugUserWords } from "../controllers/words.controller.js";

const router = Router();

// GET /api/words?level=1 -> gera novas palavras
router.get("/words", requireAuth, generateWords);

// GET /api/words/saved -> lista palavras já geradas/salvas pelo usuário
router.get("/words/saved", requireAuth, listSavedWords);

router.get("/words/debug", debugUserWords);

export default router