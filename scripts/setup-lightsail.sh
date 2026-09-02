#!/usr/bin/env bash
set -euo pipefail

# Rode isto DENTRO da VM Lightsail (Ubuntu), como usuário com sudo.
# 1) Abra a porta 80 (e 443 se for ter HTTPS) no firewall do Lightsail.
# 2) Copie o .env da clínica para /var/www/clinica/.env

APP_DIR=/var/www/clinica
REPO=https://github.com/diasxzz/clinica-nova-visao.git

sudo mkdir -p "$APP_DIR"
sudo chown "$USER:$USER" "$APP_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO" "$APP_DIR"
else
  git -C "$APP_DIR" pull --ff-only origin main
fi

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "Crie $APP_DIR/.env com VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, CLINICA_API_KEY e OTICA_API_URL"
  exit 1
fi

export $(grep -v '^#' .env | xargs)

if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

npm ci
npm run build

sudo tee /etc/systemd/system/clinica.service >/dev/null <<'UNIT'
[Unit]
Description=Clinica Nova Visao
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/clinica
EnvironmentFile=/var/www/clinica/.env
Environment=PORT=4173
ExecStart=/usr/bin/node /var/www/clinica/server/production.mjs
Restart=always
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
UNIT

sudo chown -R www-data:www-data "$APP_DIR"
sudo systemctl daemon-reload
sudo systemctl enable --now clinica.service

if ! command -v nginx >/dev/null; then
  sudo apt-get update
  sudo apt-get install -y nginx
fi

sudo tee /etc/nginx/sites-available/clinica >/dev/null <<'NGINX'
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;

  location / {
    proxy_pass http://127.0.0.1:4173;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
NGINX

sudo ln -sfn /etc/nginx/sites-available/clinica /etc/nginx/sites-enabled/clinica
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "Pronto. Abra http://IP_DA_VM"
