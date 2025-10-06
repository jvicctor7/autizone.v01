# AutiZone (Monorepo)

Este repositório contém:
- `web/` — app Vite/React (front-end);
- `api/` — API Node/Express/Prisma/PostgreSQL (back-end).

## Como começar (dev)
1. Requisitos: Docker + Node 20.
2. Suba banco e API:
   ```bash
   docker compose up -d
   ```
   API: http://localhost:3333/api (saúde: `/health`).
3. Configure o front:
   ```bash
   cd web
   cp .env.example .env
   # .env deve ter VITE_API_URL=http://localhost:3333/api
   npm i
   npm run dev
   ```
   Front: http://localhost:5173

## Variáveis de ambiente
- `web/.env` → `VITE_API_URL` aponta para a API.
- `api/.env` → veja `api/.env.example`.

## Deploy
- **API (Render/Railway)**
  - Root directory: `api/`
  - Vars: `DATABASE_URL`, `JWT_SECRET`, `PORT=3333`, `CORS_ORIGIN=https://SEU_FRONT.vercel.app`
  - Start: `npm ci && npx prisma db push && node prisma/seed.js && node src/server.js`
- **Web (Vercel/Netlify)**
  - Root directory: `web/`
  - Vars: `VITE_API_URL=https://SUA_API/render.app/api`
