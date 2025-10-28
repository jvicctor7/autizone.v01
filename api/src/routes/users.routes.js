// src/routes/users.routes.js
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { requireAuth } from "../middlewares/requireAuth.js";

const prisma = new PrismaClient();
export const usersRouter = Router();

// Pegar dados do usuário logado
usersRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao buscar usuário." });
  }
});

// Atualizar nome ou email
usersRouter.put("/me", requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...(name && { name }), ...(email && { email }) },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao atualizar usuário." });
  }
});

// Alterar senha
usersRouter.put("/me/password", requireAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Senha obrigatória." });

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });
    return res.json({ message: "Senha atualizada com sucesso." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao atualizar senha." });
  }
});