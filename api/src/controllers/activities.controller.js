// src/controllers/activities.controller.js
import { prisma } from "../lib/prisma.js";

// mapa: número que o front manda -> enum que está no Prisma
const LEVEL_MAP = {
  1: "INICIAL",
  2: "BASICO",
  3: "INTERMEDIARIO",
  4: "AVANCADO",
};

// se vier string já no enum, só devolve; se vier número, converte
function normalizeLevel(level) {
  if (!level) return "INICIAL";
  if (typeof level === "number") {
    return LEVEL_MAP[level] || "INICIAL";
  }
  // já veio "INICIAL", "BASICO", etc
  return level;
}

/* =========================================
   1. LISTAR ATIVIDADES
========================================= */
export async function listActivities(req, res) {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "asc" },
    });
    return res.json(activities);
  } catch (err) {
    console.error("Erro ao listar atividades:", err);
    return res.status(500).json({ message: "Erro ao listar atividades." });
  }
}

/* =========================================
   2. PEGAR UMA ATIVIDADE
========================================= */
export async function getActivity(req, res) {
  try {
    const { id } = req.params;
    const activity = await prisma.activity.findUnique({
      where: { id },
    });
    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada." });
    }
    return res.json(activity);
  } catch (err) {
    console.error("Erro ao buscar atividade:", err);
    return res.status(500).json({ message: "Erro ao buscar atividade." });
  }
}

/* =========================================
   3. CRIAR ATIVIDADE (admin)
========================================= */
export async function createActivity(req, res) {
  try {
    const { title, description = "", level = "INICIAL", mediaUrl } = req.body;
    const normLevel = normalizeLevel(level);

    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        level: normLevel,
        mediaUrl,
      },
    });

    return res.status(201).json(activity);
  } catch (err) {
    console.error("Erro ao criar atividade:", err);
    return res.status(500).json({ message: "Erro ao criar atividade." });
  }
}

/* =========================================
   4. ATUALIZAR ATIVIDADE (admin)
========================================= */
export async function updateActivity(req, res) {
  try {
    const { id } = req.params;
    const { title, description, level, mediaUrl } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (mediaUrl !== undefined) data.mediaUrl = mediaUrl;
    if (level !== undefined) data.level = normalizeLevel(level);

    const updated = await prisma.activity.update({
      where: { id },
      data,
    });

    return res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar atividade:", err);
    return res.status(500).json({ message: "Erro ao atualizar atividade." });
  }
}

/* =========================================
   5. DELETAR ATIVIDADE (admin)
========================================= */
export async function deleteActivity(req, res) {
  try {
    const { id } = req.params;
    await prisma.activity.delete({
      where: { id },
    });
    return res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar atividade:", err);
    return res.status(500).json({ message: "Erro ao deletar atividade." });
  }
}

/* =========================================
   6. TRACK DA PALAVRA (o que o front chama)
   Rota: POST /api/activities/track-word
========================================= */
export async function trackWordActivity(req, res) {
  // isso aqui ajuda MUITO a debugar
  console.log("📥 /activities/track-word recebeu:", req.body);
  console.log("👤 user no req:", req.user);

  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    let { level, word, correct = true } = req.body;

    if (!word) {
      return res.status(400).json({ message: "Palavra (word) é obrigatória." });
    }

    // garante que o nível está no formato do prisma
    const normLevel = normalizeLevel(level);

    // 1) garantir que existe uma activity para essa palavra + nível
    let activity = await prisma.activity.findFirst({
      where: {
        title: word,
        level: normLevel,
      },
    });

    // se não existir, cria na hora
    if (!activity) {
      activity = await prisma.activity.create({
        data: {
          title: word,
          description: `Atividade auto-gerada para a palavra "${word}"`,
          level: normLevel,
        },
      });
      console.log("🆕 Atividade criada automaticamente:", activity.id);
    }

    // 2) registrar tentativa
    const attempt = await prisma.attempt.create({
      data: {
        userId,
        activityId: activity.id,
        correct: Boolean(correct),
        score: correct ? 1 : 0,
        details: {
          word,
          level: normLevel,
          finishedAt: new Date().toISOString(),
        },
      },
    });

    // 3) atualizar / criar progresso
    const xpEarned = correct ? 10 : 5;

    let progress = await prisma.progress.findUnique({
      where: { userId },
    });

    if (progress) {
      progress = await prisma.progress.update({
        where: { userId },
        data: {
          xp: { increment: xpEarned }, // soma no banco
          updatedAt: new Date(),
        },
      });
    } else {
      progress = await prisma.progress.create({
        data: {
          userId,
          xp: xpEarned,
          level: "INICIAL",
        },
      });
    }

    console.log(
      `✅ tentativa salva (user=${userId}) / xp agora=${progress.xp}`
    );

    return res.json({
      ok: true,
      attemptId: attempt.id,
      xp: progress.xp,
      activityId: activity.id,
    });
  } catch (err) {
    console.error("❌ Erro ao registrar tentativa (track):", err);
    return res.status(500).json({ message: "Erro ao registrar tentativa." });
  }
}