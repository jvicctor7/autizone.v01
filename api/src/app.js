import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { router } from "./routes/index.js";
import { env } from "./lib/env.js";

export function buildApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: "2mb" }));
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api", router);

  app.use((req, res) => res.status(404).json({ message: "Rota não encontrada" }));
  return app;
}
