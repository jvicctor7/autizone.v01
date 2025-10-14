// src/app.js
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { router } from "./routes/index.js";
import authRouter from "./routes/auth.routes.js"; // <<< ADICIONADO
import { env } from "./lib/env.js";

export function buildApp() {
  const app = express();

  // Middlewares que você já tinha
  app.use(helmet());
  app.use(express.json({ limit: "2mb" }));
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(morgan("dev"));

  // Healthcheck que você já tinha
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // <<< ADICIONADO: rotas de autenticação
  // Ficam disponíveis em /api/auth/login e /api/auth/register
  app.use("/api/auth", authRouter);

  // Suas rotas já existentes agrupadas em /api
  app.use("/api", router);

  // 404 que você já tinha
  app.use((_req, res) => res.status(404).json({ message: "Rota não encontrada" }));

  return app;
}