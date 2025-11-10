// src/controllers/activities.controller.js
import { prisma } from "../lib/prisma.js";

// mapa: número que o front manda -> enum do Prisma
const LEVEL_MAP = {
  1: "INICIAL",
  2: "BASICO",
  3: "INTERMEDIARIO",
  4: "AVANCADO",
};

function normalizeLevel(level) {
  if (!level) return "INICIAL";
  if (typeof level === "number") return LEVEL_MAP[level] || "INICIAL";
  return level;
}

/* =========================================
   LISTAR TODAS AS ATIVIDADES
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
   PEGAR UMA ATIVIDADE ESPECÍFICA
========================================= */
export async function getActivity(req, res) {
  try {
    const { id } = req.params;
    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) return res.status(404).json({ message: "Atividade não encontrada." });
    return res.json(activity);
  } catch (err) {
    console.error("Erro ao buscar atividade:", err);
    return res.status(500).json({ message: "Erro ao buscar atividade." });
  }
}

/* =========================================
   CRIAR ATIVIDADE (Admin)
========================================= */
export async function createActivity(req, res) {
  try {
    const { title, description = "", level = "INICIAL", mediaUrl } = req.body;
    const normLevel = normalizeLevel(level);
    const activity = await prisma.activity.create({
      data: { title, description, level: normLevel, mediaUrl },
    });
    return res.status(201).json(activity);
  } catch (err) {
    console.error("Erro ao criar atividade:", err);
    return res.status(500).json({ message: "Erro ao criar atividade." });
  }
}

/* =========================================
   ATUALIZAR ATIVIDADE (Admin)
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

    const updated = await prisma.activity.update({ where: { id }, data });
    return res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar atividade:", err);
    return res.status(500).json({ message: "Erro ao atualizar atividade." });
  }
}

/* =========================================
   DELETAR ATIVIDADE (Admin)
========================================= */
export async function deleteActivity(req, res) {
  try {
    const { id } = req.params;
    await prisma.activity.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar atividade:", err);
    return res.status(500).json({ message: "Erro ao deletar atividade." });
  }
}

/* =========================================
   TRACK DA PALAVRA (usuário jogando)
   POST /api/activities/track-word
========================================= */
export async function trackWordActivity(req, res) {
  console.log("📥 /activities/track-word recebeu:", req.body);
  console.log("👤 user no req:", req.user);

  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Usuário não autenticado." });

    let { level, word, correct = true, xpGain } = req.body;
    if (!word) return res.status(400).json({ message: "Palavra (word) é obrigatória." });

    const normLevel = normalizeLevel(level);

    // 1️ Garante que exista a atividade
    let activity = await prisma.activity.findFirst({
      where: { title: word, level: normLevel },
    });

    if (!activity) {
      activity = await prisma.activity.create({
        data: {
          title: word,
          description: `Atividade auto-gerada para "${word}"`,
          level: normLevel,
        },
      });
      console.log("🆕 Atividade criada automaticamente:", activity.id);
    }

    // 2️ Registra tentativa
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

    // 3️ Calcula XP ganho
    const xpEarned = correct ? (typeof xpGain === "number" ? xpGain : 10) : 5;
    console.log(`➡️ XP ganho calculado: ${xpEarned}`);

    // 4️ Atualiza progresso
    let progress = await prisma.progress.findUnique({ where: { userId } });

    if (progress) {
      progress = await prisma.progress.update({
        where: { userId },
        data: {
          xp: { increment: xpEarned },
          updatedAt: new Date(),
        },
      });
    } else {
      progress = await prisma.progress.create({
        data: { userId, xp: xpEarned, level: "INICIAL" },
      });
    }

    console.log(`✅ XP atualizado no banco: ${progress.xp}`);

    // 5️ Retorna o XP atualizado para o front
    return res.json({
      ok: true,
      attemptId: attempt.id,
      xp: progress.xp,
      activityId: activity.id,
    });
  } catch (err) {
    console.error("❌ Erro ao registrar tentativa:", err);
    return res.status(500).json({ message: "Erro ao registrar tentativa." });
  }
}