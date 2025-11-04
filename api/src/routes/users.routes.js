// src/routes/users.routes.js
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { requireAuth } from "../middlewares/requireAuth.js";

const prisma = new PrismaClient();
export const usersRouter = Router();

// ==============================
// 🧠 Obter dados do usuário logado
// ==============================
usersRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.json(user);
  } catch (err) {
    console.error("GET /users/me ->", err);
    return res.status(500).json({ message: "Erro ao buscar usuário." });
  }
});

// ==============================
// ✏️ Atualizar nome ou email
// ==============================
usersRouter.put("/me", requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ message: "Nada para atualizar." });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error("PUT /users/me ->", err);
    return res.status(500).json({ message: "Erro ao atualizar usuário." });
  }
});

// ==============================
// 🔒 Alterar senha com validação
// ==============================
// agora aceita currentPassword OU password OU oldPassword
usersRouter.put("/me/password", requireAuth, async (req, res) => {
  console.log("DEBUG /me/password payload recebido:", req.body);

  try {
    // o front às vezes manda "password", às vezes "currentPassword"
    const {
      currentPassword,
      password,
      oldPassword,
      newPassword,
    } = req.body;

    // pega o que vier
    const senhaAtual = currentPassword || password || oldPassword;

    // validações básicas
    if (!senhaAtual || !newPassword) {
      return res
        .status(400)
        .json({ message: "Senha atual e nova são obrigatórias." });
    }

    // busca usuário
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // confere senha atual
    const confere = await bcrypt.compare(senhaAtual, user.passwordHash);
    if (!confere) {
      return res.status(400).json({ message: "Senha atual incorreta." });
    }

    // gera hash da nova
    const novoHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: novoHash },
    });

    return res.json({ message: "Senha alterada com sucesso." });
  } catch (err) {
    console.error("PUT /users/me/password ->", err);
    return res.status(500).json({ message: "Erro ao alterar senha." });
  }
});