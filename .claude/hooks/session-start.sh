#!/usr/bin/env bash
# Prepares Claude Code cloud sessions so every device starts from the same working state.
# Runs only in remote (cloud) sessions; local machines manage their own setup.
set -euo pipefail
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"
npm ci --no-audit --no-fund >/dev/null 2>&1 || echo "npm ci failed; run it manually." >&2
git fetch --quiet origin main 2>/dev/null || true
echo "AquaSentinel session ready. Read CLAUDE.md and docs/PROJECT_RULES.md before working."
