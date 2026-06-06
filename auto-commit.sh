#!/bin/bash

# Auto-commit script with GitHub token
# Usage: ./auto-commit.sh "commit message"

GITHUB_TOKEN="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"
REPO_URL="https://eralcazar:${GITHUB_TOKEN}@github.com/eralcazar/osarchitect.git"
COMMIT_MSG="${1:-auto-commit}"

cd "$(dirname "$0")"

echo "🚀 Adding files..."
git add -A

echo "📝 Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo "⬆️  Pushing to GitHub..."
git remote set-url origin "$REPO_URL"
git push origin main

echo "✅ Done!"
