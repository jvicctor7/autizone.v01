import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export const authRouter = Router();

// POST /api/auth/login
// Aceita só senha; usa email padrão do .env se nenhum vier no body
authRouter.post('/login', async (req, res) => {
  try {
    const { password, email } = req.body || {};
    const effectiveEmail = email || process.env.DEFAULT_LOGIN_EMAIL;

    if (!password || !effectiveEmail) {
      return res.status(400).json({ message: 'Credenciais ausentes.' });
    }

    const user = await prisma.user.findUnique({ where: { email: effectiveEmail } });
    if (!user) return res.status(401).json({ message: 'Usuário não encontrado.' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Senha inválida.' });

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao autenticar.' });
  }
});

export default authRouter;
