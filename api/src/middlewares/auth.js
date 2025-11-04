// src/middlewares/auth.js
import jwt from "jsonwebtoken";
import { env } from "../lib/env.js"; // você já usa isso no server.js

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    // esperado: "Bearer xxxxx"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Token ausente" });
    }

    // payload que você criou lá no login
    const payload = jwt.verify(token, env.JWT_SECRET);
    // normalmente você assina assim: { sub: user.id, role: user.role, email: user.email }

    // normaliza pra sempre ter req.user.id
    req.user = {
      id: payload.sub, // 👈 isso é o que o Prisma usa
      role: payload.role || "USER",
      email: payload.email || null,
      // guarda o payload bruto se alguém quiser
      _raw: payload,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

export function requireAdmin(req, res, next) {
  if (req?.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Apenas admin" });
  }
  return next();
}