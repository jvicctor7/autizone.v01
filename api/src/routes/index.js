// src/routes/index.js
import { Router } from "express";

import authRouter from "./auth.routes.js";
import { usersRouter } from "./users.routes.js";
import { activitiesRouter } from "./activities.routes.js";
import { progressRouter } from "./progress.routes.js";
import { wordsRouter } from "./words.routes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/activities", activitiesRouter);
router.use("/progress", progressRouter);
router.use("/", wordsRouter);