import { prisma } from "../lib/prisma.js";

export async function getMyProgress(req, res) {
  const [progress, attempts] = await Promise.all([
    prisma.progress.findUnique({ where: { userId: req.user.sub } }),
    prisma.attempt.findMany({
      where: { userId: req.user.sub },
      include: { activity: { select: { title: true, level: true } } },
      orderBy: { startedAt: "desc" }
    })
  ]);
  res.json({ progress, attempts });
}
