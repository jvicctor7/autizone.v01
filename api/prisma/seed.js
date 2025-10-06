import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@autizone.local" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@autizone.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  const activities = [
    { title: "Rimar palavras", description: "Associe rimas", level: "INICIAL" },
    { title: "Sílabas", description: "Separe em sílabas", level: "BASICO" },
    { title: "Completar palavras", description: "Arraste letras", level: "INTERMEDIARIO" }
  ];

  for (const a of activities) {
    await prisma.activity.create({ data: a });
  }

  console.log("Seed ok ✨");
}

main().finally(() => prisma.$disconnect());
