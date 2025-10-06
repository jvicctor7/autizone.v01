import { Router } from "express";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";
import {
  listActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  submitAttempt
} from "../controllers/activities.controller.js";

export const activitiesRouter = Router();

activitiesRouter.get("/activities", listActivities);
activitiesRouter.get("/activities/:id", getActivity);
activitiesRouter.post("/activities", requireAuth, requireAdmin, createActivity);
activitiesRouter.patch("/activities/:id", requireAuth, requireAdmin, updateActivity);
activitiesRouter.delete("/activities/:id", requireAuth, requireAdmin, deleteActivity);
activitiesRouter.post("/activities/:id/attempts", requireAuth, submitAttempt);
