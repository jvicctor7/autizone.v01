// src/routes/progress.routes.js
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getMyProgress } from "../controllers/progress.controller.js";

export const progressRouter = Router();

// agora bate com o front: /api/progress/me
progressRouter.get("/me", requireAuth, getMyProgress);