import jwt from "jsonwebtoken";
import { env } from "../lib/env.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Token ausente" });
  const [, token] = header.split(" ");
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload; // { sub, role }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

export function requireAdmin(req, res, next) {
  if (req?.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Apenas admin" });
  }
  next();
}
