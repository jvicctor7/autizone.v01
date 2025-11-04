// src/controllers/progress.controller.js
import { prisma } from "../lib/prisma.js";

export async function getMyProgress(req, res) {
  try {
    // depois que centralizamos o middleware, o certo é req.user.id
    // mas deixo o .sub como fallback caso tenha algum token antigo
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const [progress, attempts] = await Promise.all([
      prisma.progress.findUnique({
        where: { userId },
      }),
      prisma.attempt.findMany({
        where: { userId },
        include: {
          activity: {
            select: { title: true, level: true },
          },
        },
        orderBy: { startedAt: "desc" },
      }),
    ]);

    return res.json({
      progress: progress ?? null,
      attempts,
    });
  } catch (err) {
    console.error("Erro ao buscar progresso do usuário:", err);
    return res.status(500).json({ message: "Erro ao buscar progresso." });
  }
}