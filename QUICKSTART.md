# Quick Start

## Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (otro terminal)
cd frontend
npm install
npm run dev

# Mobile (otro terminal)
cd mobile
npm install
npm start
```

## Production (Railway)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Set variables
railway variables set GITHUB_TOKEN github_pat_...
railway variables set ANTHROPIC_API_KEY sk-ant-...

# 5. Deploy
cd backend
railway up
```

## Test Autonomous Commits

```bash
curl -X POST http://localhost:3000/api/deploy/commit \
  -H "Content-Type: application/json" \
  -d '{
    "message": "test: autonomous",
    "files": { "TEST.md": "# Works!" }
  }'
```

---

**That's it. System is ready.**
