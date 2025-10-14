import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const authRouter = Router();

/**
 * POST /api/auth/register
 * Cria um novo usuário
 */
authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos." });
    }

    // Verifica se o usuário já existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "E-mail já cadastrado." });
    }

    // Gera hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Cria usuário no banco
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "USER" },
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao registrar usuário." });
  }
});

/**
 * POST /api/auth/login
 * Login de usuário
 */
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Credenciais ausentes." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Usuário não encontrado." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Senha inválida." });

    // Cria token JWT
    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao autenticar." });
  }
});

export default authRouter;