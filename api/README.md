# AutiZone API

Back-end para o projeto AutiZone (Node.js + Express + Prisma + PostgreSQL).

## Endpoints (base: `/api`)

### Autenticação `/auth`
- `POST /auth/register` { name, email, password }
- `POST /auth/login` { email, password } → { token }
- `GET /auth/me` (Bearer token)

### Atividades
- `GET /activities` → lista atividades
- `GET /activities/:id` → detalhe
- `POST /activities` (admin) → cria
- `PATCH /activities/:id` (admin) → atualiza
- `DELETE /activities/:id` (admin) → remove
- `POST /activities/:id/attempts` (autenticado) → registra tentativa { correct, score?, details? }

### Progresso
- `GET /me/progress` (autenticado) → progresso e histórico de tentativas

## Rodando localmente
```bash
cp .env.example .env
npm i
npx prisma db push
npm run db:seed
npm run dev
```

## Deploy (Railway/Render)
1. Crie um Postgres gerenciado.
2. Configure as variáveis: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT=3333`.
3. Start: `npm ci && npx prisma db push && node prisma/seed.js && node src/server.js`.
