// src/controllers/activities.controller.js
import { prisma } from "../lib/prisma.js";

// mapa: número que o front manda -> enum do Prisma
const LEVEL_MAP = {
  1: "INICIAL",
  2: "BASICO",
  3: "INTERMEDIARIO",
  4: "AVANCADO",
};

// e o inverso (enum string -> número) para quando o front enviar enum
const LEVEL_MAP_INVERSE = {
  INICIAL: 1,
  BASICO: 2,
  INTERMEDIARIO: 3,
  AVANCADO: 4,
};

function normalizeLevel(level) {
  if (!level) return "INICIAL";
  if (typeof level === "number") return LEVEL_MAP[level] || "INICIAL";
  // se já for string com número em texto
  const asNum = Number(level);
  if (!Number.isNaN(asNum)) return LEVEL_MAP[asNum] || "INICIAL";
  // se veio "INICIAL" | "BASICO" ...
  return LEVEL_MAP[level] || level || "INICIAL";
}

function getLevelNum(level) {
  // level pode ser number (1,2,3), enum string ("INICIAL") ou string num "1"
  if (typeof level === "number") return level;
  const asNum = Number(level);
  if (!Number.isNaN(asNum)) return asNum;
  if (typeof level === "string") {
    const up = level.toUpperCase();
    if (LEVEL_MAP_INVERSE[up]) return LEVEL_MAP_INVERSE[up];
  }
  return 1;
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
   TRACK DA PALAVRA (usuário jogando) - VERSÃO CORRIGIDA
   POST /api/activities/track-word
   - atualiza XP do usuário na tabela Progress
   - registra Attempt
   - cria/atualiza GeneratedWord E UserGeneratedWord (tabela de junção)
========================================= */
export async function trackWordActivity(req, res) {
  console.log("📥 /activities/track-word recebeu:", req.body);
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Usuário não autenticado." });

    let { level, word, correct = true, xpGain } = req.body;
    if (!word) return res.status(400).json({ message: "Palavra (word) é obrigatória." });

    // normalizações
    const wordStr = String(word).trim();
    const wordLower = wordStr.toLowerCase();

    const normLevel = normalizeLevel(level); // enum string
    const levelNum = getLevelNum(level); // number (1..4)

    // 1️ Garante que exista a atividade (usando enum level)
    let activity = await prisma.activity.findFirst({
      where: { title: wordStr, level: normLevel },
    });

    if (!activity) {
      activity = await prisma.activity.create({
        data: {
          title: wordStr,
          description: `Atividade auto-gerada para "${wordStr}"`,
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
          word: wordStr,
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

    // 5️ CORREÇÃO: Usar UserGeneratedWord em vez de userId em GeneratedWord
    try {
      // Primeiro, garante que existe a GeneratedWord
      let gw = await prisma.generatedWord.findFirst({
        where: { word: wordLower, level: levelNum },
      });

      if (!gw) {
        gw = await prisma.generatedWord.create({
          data: {
            word: wordLower,
            level: levelNum,
            times: 1,
            source: "manual",
          },
        });
        console.log(`🆕 GeneratedWord criado para "${wordLower}"`);
      } else {
        // Incrementa o contador global
        await prisma.generatedWord.update({
          where: { id: gw.id },
          data: { times: { increment: 1 } },
        });
        console.log(`🔁 GeneratedWord atualizado (increment times) para "${wordLower}"`);
      }

      // AGORA SIM: Vincula ao usuário através da tabela de junção UserGeneratedWord
      const userWord = await prisma.userGeneratedWord.upsert({
        where: {
          userId_generatedWordId: {
            userId: userId,
            generatedWordId: gw.id
          }
        },
        create: {
          userId: userId,
          generatedWordId: gw.id,
          times: 1
        },
        update: {
          times: { increment: 1 }
        }
      });

      console.log(`✅ Palavra "${wordLower}" salva para usuário ${userId} (times: ${userWord.times})`);

    } catch (err) {
      console.warn("Não foi possível salvar palavra para usuário:", err.message ?? err);
      // Não falha toda a requisição por conta disso
    }

    // 6️ Retorna o XP atualizado para o front
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

/* =========================================
   GET PROGRESSO DO USUÁRIO
   GET /api/progress/me
========================================= */
export async function getMyProgress(req, res) {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Usuário não autenticado." });

    let progress = await prisma.progress.findUnique({ where: { userId } });

    if (!progress) {
      progress = await prisma.progress.create({
        data: { userId, xp: 0, level: "INICIAL" },
      });
    }

    return res.json(progress);
  } catch (err) {
    console.error("Erro ao buscar progresso:", err);
    return res.status(500).json({ message: "Erro ao buscar progresso." });
  }
}

/* =========================================
   ATUALIZAR PROGRESSO DO USUÁRIO
   PUT /api/progress/me
========================================= */
export async function updateMyProgress(req, res) {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Usuário não autenticado." });

    const { xp, level, streak } = req.body;

    const data = {};
    if (xp !== undefined) data.xp = xp;
    if (level !== undefined) data.level = normalizeLevel(level);
    if (streak !== undefined) data.streak = streak;

    let progress = await prisma.progress.findUnique({ where: { userId } });

    if (progress) {
      progress = await prisma.progress.update({
        where: { userId },
        data,
      });
    } else {
      progress = await prisma.progress.create({
        data: { 
          userId, 
          xp: xp || 0, 
          level: normalizeLevel(level) || "INICIAL",
          streak: streak || 0
        },
      });
    }

    return res.json(progress);
  } catch (err) {
    console.error("Erro ao atualizar progresso:", err);
    return res.status(500).json({ message: "Erro ao atualizar progresso." });
  }
}