// src/routes/activities.routes.js
import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import {
  listActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  trackWordActivity,
} from "../controllers/activities.controller.js";

export const activitiesRouter = Router();

// como o index monta em /activities, aqui NÃO coloca /activities de novo
activitiesRouter.get("/", listActivities);
activitiesRouter.get("/:id", getActivity);

activitiesRouter.post("/", requireAuth, requireAdmin, createActivity);
activitiesRouter.patch("/:id", requireAuth, requireAdmin, updateActivity);
activitiesRouter.delete("/:id", requireAuth, requireAdmin, deleteActivity);
activitiesRouter.post("/track-word", requireAuth, trackWordActivity);