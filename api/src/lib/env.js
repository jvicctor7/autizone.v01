import "dotenv/config";

const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "PORT",
  "CORS_ORIGIN"
];

for (const k of required) {
  if (!process.env[k]) {
    console.warn(`[warn] variável ${k} não definida (.env)`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  PORT: Number(process.env.PORT || 3333),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
};
