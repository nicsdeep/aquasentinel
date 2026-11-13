#!/usr/bin/env bash
# Blocks data-destroying SQL in new migrations, because production migrates automatically with no human approval.
# A migration may only contain such statements if it states why, with a line like:
#   -- allow-destructive: drop unused table legacy_readings (confirmed empty in production)
# Usage: scripts/check-destructive-sql.sh [base-ref]   (no base-ref = check every migration)
set -euo pipefail

DIR="supabase/migrations"
BASE_REF="${1:-}"
PATTERN='\b(drop[[:space:]]+(table|schema|column|view|materialized[[:space:]]+view|type|database)|truncate|delete[[:space:]]+from|alter[[:space:]]+column[[:space:]]+[a-z0-9_"]+[[:space:]]+(set[[:space:]]+data[[:space:]]+)?type)\b'

if [[ -n "$BASE_REF" ]] && git rev-parse --verify --quiet "$BASE_REF" >/dev/null; then
  mapfile -t files < <(git diff --name-only --diff-filter=A "$BASE_REF"...HEAD -- "$DIR" | grep -E '\.sql$' || true)
else
  shopt -s nullglob
  files=("$DIR"/*.sql)
fi

fail=0
for f in "${files[@]}"; do
  if grep -qiE '^[[:space:]]*--[[:space:]]*allow-destructive:[[:space:]]*[^[:space:]]' "$f"; then
    continue
  fi
  # Ignore comment lines, then look for destructive statements.
  hits="$(grep -nviE '^[[:space:]]*--' "$f" | grep -iE "$PATTERN" || true)"
  if [[ -n "$hits" ]]; then
    echo "::error file=$f::Destructive SQL found. Production migrates automatically, so either make the change non-destructive (expand/contract) or add '-- allow-destructive: <reason>' to the file after confirming no data is lost."
    echo "$hits"
    fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "Destructive SQL check OK (${#files[@]} migration(s) checked)."
