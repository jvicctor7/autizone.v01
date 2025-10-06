import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getMyProgress } from "../controllers/progress.controller.js";

export const progressRouter = Router();
progressRouter.get("/me/progress", requireAuth, getMyProgress);
