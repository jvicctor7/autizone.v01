import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const baseSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  level: z.enum(["INICIAL", "BASICO", "INTERMEDIARIO", "AVANCADO"]),
  mediaUrl: z.string().url().optional()
});

export async function listActivities(req, res) {
  const items = await prisma.activity.findMany({ orderBy: { createdAt: "desc" } });
  res.json(items);
}

export async function getActivity(req, res) {
  const item = await prisma.activity.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ message: "Não encontrada" });
  res.json(item);
}

export async function createActivity(req, res) {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const item = await prisma.activity.create({ data: parsed.data });
  res.status(201).json(item);
}

export async function updateActivity(req, res) {
  const parsed = baseSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const item = await prisma.activity.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(item);
}

export async function deleteActivity(req, res) {
  await prisma.activity.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

export async function submitAttempt(req, res) {
  const schema = z.object({
    correct: z.boolean(),
    score: z.number().int().min(0).max(100).default(0),
    details: z.record(z.any()).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const activity = await prisma.activity.findUnique({ where: { id: req.params.id } });
  if (!activity) return res.status(404).json({ message: "Atividade não encontrada" });

  const attempt = await prisma.attempt.create({
    data: {
      userId: req.user.sub,
      activityId: activity.id,
      correct: parsed.data.correct,
      score: parsed.data.score,
      details: parsed.data.details ?? null,
      completedAt: new Date()
    }
  });

  const delta = parsed.data.correct ? 10 : 4;
  await prisma.progress.upsert({
    where: { userId: req.user.sub },
    update: { xp: { increment: delta } },
    create: { userId: req.user.sub, xp: delta, level: activity.level }
  });

  res.status(201).json(attempt);
}
