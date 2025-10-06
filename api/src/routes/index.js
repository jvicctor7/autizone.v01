import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { activitiesRouter } from "./activities.routes.js";
import { progressRouter } from "./progress.routes.js";

export const router = Router();
router.use("/auth", authRouter);
router.use(activitiesRouter);
router.use(progressRouter);
