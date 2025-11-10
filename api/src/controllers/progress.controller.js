// src/controllers/progress.controller.js
import { prisma } from "../lib/prisma.js";

/**
 * Tabela de XP necessária para cada "passo".
 * XP_LEVEL_STEPS[i] = XP mínima para atingir o nível (i+1).
 * Ex.: 0 -> nível 1, 60 -> nível 2, 140 -> nível 3, ...
 */
const XP_LEVEL_STEPS = [0, 60, 140, 240, 360, 500, 680];

function calcPlayerLevel(totalXp) {
  let level = 1;
  for (let i = 0; i < XP_LEVEL_STEPS.length; i++) {
    if (totalXp >= XP_LEVEL_STEPS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

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

    const xp = progress?.xp ?? 0;
    const playerLevel = calcPlayerLevel(xp);

    // Retornamos progress (padrão) e também playerLevel para o front usar direto.
    return res.json({
      progress: progress ?? null,
      attempts,
      playerLevel,
    });
  } catch (err) {
    console.error("Erro ao buscar progresso do usuário:", err);
    return res.status(500).json({ message: "Erro ao buscar progresso." });
  }
}