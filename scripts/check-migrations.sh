#!/usr/bin/env bash
# Guards the migration history (run in CI on every PR and push).
#  1. File names must be <14-digit UTC timestamp>_<snake_case_name>.sql
#  2. Timestamps must be unique
#  3. Migrations already on the base branch are immutable (no edits, renames or deletions)
#  4. New migrations must be newer than every migration on the base branch (no out-of-order history)
# Usage: scripts/check-migrations.sh [base-ref]   e.g. scripts/check-migrations.sh origin/main
set -euo pipefail

DIR="supabase/migrations"
BASE_REF="${1:-}"
fail=0

shopt -s nullglob
files=("$DIR"/*.sql)

for f in "${files[@]}"; do
  name="$(basename "$f")"
  if [[ ! "$name" =~ ^[0-9]{14}_[a-z0-9_]+\.sql$ ]]; then
    echo "::error file=$f::Migration name must look like 20260101120000_short_description.sql"
    fail=1
  fi
done

dupes="$(for f in "${files[@]}"; do basename "$f" | cut -c1-14; done | sort | uniq -d)"
if [[ -n "$dupes" ]]; then
  echo "::error::Duplicate migration timestamps: $dupes"
  fail=1
fi

if [[ -n "$BASE_REF" ]] && git rev-parse --verify --quiet "$BASE_REF" >/dev/null; then
  changed="$(git diff --name-status "$BASE_REF"...HEAD -- "$DIR" | grep -vE '^A' || true)"
  if [[ -n "$changed" ]]; then
    echo "::error::Existing migrations must never be edited, renamed or deleted. Add a new migration instead:"
    echo "$changed"
    fail=1
  fi

  latest_base="$(git ls-tree --name-only "$BASE_REF" "$DIR/" 2>/dev/null | xargs -r -n1 basename | grep -E '^[0-9]{14}_' | sort | tail -n1 | cut -c1-14 || true)"
  if [[ -n "$latest_base" ]]; then
    for f in $(git diff --name-only --diff-filter=A "$BASE_REF"...HEAD -- "$DIR"); do
      ts="$(basename "$f" | cut -c1-14)"
      if [[ "$ts" < "$latest_base" || "$ts" == "$latest_base" ]]; then
        echo "::error file=$f::Migration $ts is older than the newest migration on $BASE_REF ($latest_base). Rebase and regenerate it with 'npx supabase migration new <name>'."
        fail=1
      fi
    done
  fi
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "Migration history OK (${#files[@]} migration(s))."
