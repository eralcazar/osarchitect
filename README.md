# ERP OS v2 — Fresh Start

Backend: Node.js + Hono + PostgreSQL
Frontend: React + Vite
Mobile: Expo (React Native)
Hosting: Railway

## Quick Start

### Backend
```bash
cd backend
npm install
cp src/.env.example src/.env.local
# Edit .env.local with your API keys
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
# Open http://localhost:5173
```

### Database
```bash
psql $DATABASE_URL < backend/migrations/001_init.sql
```

### Deploy to Railway
```bash
cd backend
railway login
railway link
git push origin main
```

## Full Setup Guide
See `SETUP_INSTRUCTIONS.md` for step-by-step 6-day plan.

## Architecture
- **Backend**: Hono HTTP server + AI router (Claude → OpenAI fallback)
- **Database**: PostgreSQL (multi-tenant, RLS-ready)
- **Frontend**: React + TanStack Query
- **Realtime**: PostgreSQL Realtime (Supabase)
- **Hosting**: Railway (hobby plan $5-15/mo)
