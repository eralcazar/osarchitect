# Autonomous Deployment System

## Overview

The Architect now has the ability to commit code directly to GitHub without requiring manual git commands or bash execution.

## How It Works

### 1. Endpoint: `POST /api/deploy/commit`

The Architect (or any service) can call this endpoint to commit code:

```bash
curl -X POST http://localhost:3000/api/deploy/commit \
  -H "Content-Type: application/json" \
  -d '{
    "message": "feat: add new feature",
    "files": {
      "src/components/NewFeature.tsx": "export function NewFeature() { ... }",
      "src/lib/utils.ts": "export function helper() { ... }"
    }
  }'
```

### 2. Response

```json
{
  "success": true,
  "commitSha": "abc123...",
  "message": "Committed 2 files to main"
}
```

### 3. Configuration

Set `GITHUB_TOKEN` in `.env`:
```
GITHUB_TOKEN=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
```

## Architecture

```
Architect (AI)
    ↓
    POST /api/deploy/commit
    ↓
Backend (Node.js)
    ↓
GitHub API
    ↓
Repository commit
```

## Autonomous Workflow

1. **Architect generates code** → Stores in memory
2. **Architect calls `/api/deploy/commit`** → Backend handles GitHub API
3. **Backend commits to GitHub** → No manual git commands needed
4. **CI/CD triggers** → Automatic deployment to Railway

## Production Setup

1. Deploy backend to Railway
2. Set `GITHUB_TOKEN` in Railway environment variables
3. Architect can now autonomously commit and deploy

## Security Notes

- `GITHUB_TOKEN` is server-side only
- Only accessible via backend endpoint
- Use token with minimal scopes (repo only)
- Rotate token periodically

