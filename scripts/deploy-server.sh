#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/clinica}"
BRANCH="${BRANCH:-cursor/adicao-somente-esferico}"

sudo chown -R "$USER:$USER" "$APP_DIR"
cd "$APP_DIR"

git config --global --add safe.directory "$APP_DIR" || true
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

if [ ! -f .env ]; then
  echo "ERRO: crie $APP_DIR/.env antes do deploy."
  exit 1
fi

set -a
source .env
set +a

if [ -z "${VITE_SUPABASE_URL:-}" ] || [ -z "${VITE_SUPABASE_PUBLISHABLE_KEY:-}" ]; then
  echo "ERRO: .env precisa de VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY"
  exit 1
fi

npm ci
npm run build

sudo chown -R www-data:www-data "$APP_DIR"
sudo systemctl restart clinica

echo "Deploy concluído: $(git log -1 --oneline)"
