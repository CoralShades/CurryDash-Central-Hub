#!/bin/bash
# Push all environment variables from .env.local to Vercel.
# Run from project root: bash scripts/push-env-to-vercel.sh
#
# Prerequisites:
#   - vercel CLI installed and project linked (vercel link)
#   - .env.local exists with all credentials filled in

set -e

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Run from project root."
  exit 1
fi

echo "Pushing environment variables from $ENV_FILE to Vercel..."
echo ""

while IFS= read -r line; do
  # Skip blank lines and comments
  [[ -z "$line" ]] && continue
  [[ "$line" =~ ^[[:space:]]*# ]] && continue

  # Split on first = only (handles values containing =)
  key="${line%%=*}"
  value="${line#*=}"

  # Skip if key is empty or contains spaces
  [[ -z "$key" ]] && continue
  [[ "$key" =~ [[:space:]] ]] && continue

  for env in production preview development; do
    result=$(printf '%s' "$value" | vercel env add "$key" "$env" 2>&1)
    if echo "$result" | grep -q "Added Environment Variable"; then
      echo "  + $key -> $env"
    elif echo "$result" | grep -q "already been added"; then
      echo "  ~ $key -> $env (already exists)"
    else
      echo "  ! $key -> $env: $(echo "$result" | tail -1)"
    fi
  done

done < "$ENV_FILE"

echo ""
echo "Done! Run 'vercel env ls' to verify."
