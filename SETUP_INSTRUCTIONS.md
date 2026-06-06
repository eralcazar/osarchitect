# ERP OS v2 — Setup Instructions (6 Days to MVP)

## 📋 Overview
- Fresh start (zero legacy debt)
- Backend: Node.js + Hono + PostgreSQL
- Frontend: React + Vite
- Mobile: Expo (React Native)
- Hosting: Railway

---

## 🚀 DAY 1: Infrastructure Setup

### Step 1: Railway Setup
```bash
# 1. Go to railway.app
# 2. Click "New Project"
# 3. Select "Provision PostgreSQL"
# 4. Copy DATABASE_URL from the created PostgreSQL service

# 5. Install Railway CLI
npm install -g @railway/cli

# 6. In backend folder:
cd backend
railway login
railway link
```

### Step 2: Configure Environment
```bash
# backend/src/.env.local
DATABASE_URL=postgresql://...  # From Railway
ANTHROPIC_API_KEY=sk-ant-...   # Your Claude API key
OPENAI_API_KEY=sk-...          # Your OpenAI API key
NODE_ENV=development
PORT=3000
```

---

## 💾 DAY 2-3: Backend Development

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Test Locally
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test health endpoint
curl http://localhost:3000/health
```

### Step 3: Apply Database Schema
```bash
# Run migrations
psql $DATABASE_URL < migrations/001_init.sql
```

### Step 4: Test Architect Chat
```bash
curl -X POST http://localhost:3000/api/architect/ask \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "test-org-123",
    "user_id": "test-user-456",
    "message": "Hola, como estás?"
  }'
```

---

## 🎨 DAY 4-5: Frontend Development

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Setup Environment
```bash
# .env.local
VITE_API_URL=http://localhost:3000
```

### Step 3: Start Dev Server
```bash
npm run dev
# Open http://localhost:5173
```

---

## 📱 DAY 6: Deploy to Railway

### Step 1: Commit and Push
```bash
cd backend
git add -A
git commit -m "init: fresh start backend"
git push origin main
```

### Step 2: Monitor Deploy
```bash
railway logs
railway status
```

### Step 3: Get Production URL
```bash
railway open
# Copy public URL
```

---

## 🧪 Testing Checklist

- [ ] Backend health check: `GET /health`
- [ ] Create conversation: `POST /api/architect/ask`
- [ ] Receive Architect response (Claude or OpenAI)
- [ ] Frontend loads chat UI
- [ ] Frontend → Backend communication works
- [ ] Database migrations applied

---

## 🚨 Common Issues

### "Cannot connect to database"
- Check `DATABASE_URL` format
- Test: `psql $DATABASE_URL -c "SELECT 1"`

### "API key invalid"
- Verify key format (`sk-ant-` for Anthropic)
- Check `.env.local` has no extra spaces

### "CORS errors"
- Backend has CORS enabled by default
- Check API URL in `.env.local`

---

## Next Steps (Days 7+)
1. Multi-tenant onboarding
2. Rules engine
3. Presence system
4. Mobile optimizations
5. Play Store release
6. App Store release
