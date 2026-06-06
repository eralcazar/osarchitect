# The Architect - AI-Driven ERP System

## What It Does

**The Architect** es una IA que:
1. Genera código automáticamente
2. Hace commits a GitHub sin intervención
3. Se despliega a producción automáticamente
4. Gestiona el ERP de forma autónoma

## How It Works

```
User Chat
    ↓
/api/architect/chat (Architect receives request)
    ↓
Claude/GPT-5/Gemini (AI generates code)
    ↓
/api/deploy/commit (Commits to GitHub)
    ↓
GitHub Actions/Railway (Auto-deploy)
    ↓
Production Update
```

## Key Files

- `src/lib/github-api.ts` - GitHub API integration
- `src/routes/deploy.ts` - Deploy endpoint
- `src/routes/architect.ts` - AI routing
- `backend/autonomous-commit.js` - Standalone commit tool

## Autonomous Commit Endpoint

```json
POST /api/deploy/commit
{
  "message": "feat: new module",
  "files": {
    "src/modules/new.ts": "export function new() { ... }"
  }
}
```

Response:
```json
{
  "success": true,
  "commitSha": "abc123...",
  "message": "Committed 1 file to main"
}
```

## Production URLs

- API: `https://erp-os-prod.railway.app`
- GitHub: `https://github.com/eralcazar/osarchitect`
- Docs: See RAILWAY_DEPLOY.md

## Next: Multi-Platform

- Web: React at frontend/
- iOS: React Native (Expo)
- Android: React Native (Expo)

All synced via autonomous backend.

---

**The Architect is alive when this is deployed.**
