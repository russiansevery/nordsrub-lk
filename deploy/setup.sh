#!/usr/bin/env bash
# Настройка сервера под кабинет (Ubuntu/Debian). Запускается из деплоя от root, повторный запуск безопасен.
# Аргументы: <каталог релиза> [email для Let's Encrypt]
set -euo pipefail

RELEASE_DIR="$1"
LE_EMAIL="${2:-}"
DOMAIN="${DOMAIN:-lk.nordsrub.ru}"
APP_DIR=/opt/nordsrub-lk
ENV_FILE=/etc/nordsrub-lk.env
export DEBIAN_FRONTEND=noninteractive

# Node.js 20
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  apt-get update -q
  apt-get install -yq ca-certificates curl gnupg
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -yq nodejs
fi
command -v nginx >/dev/null && command -v curl >/dev/null || { apt-get update -q; apt-get install -yq nginx curl; }

id lk >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin lk
mkdir -p "$APP_DIR/releases"

# Настройки. Файл создаётся один раз и дальше правится только руками на сервере.
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<ENV
# Пусто в BITRIX_WEBHOOK_URL и DATABASE_URL = режим показа (демо-объект, один демо-аккаунт).
APP_URL=https://$DOMAIN
DATABASE_URL=
BITRIX_WEBHOOK_URL=
INVITE_SECRET=
SMTP_URL=
MAIL_FROM="Русский Север <info@nordsrub.ru>"
DEMO_EMAIL=demo@nordsrub.ru
DEMO_PASSWORD=demo2026
ENV
fi
chmod 640 "$ENV_FILE"
chown root:lk "$ENV_FILE"

# Новый релиз становится текущим, хранятся последние пять.
ln -sfn "$RELEASE_DIR" "$APP_DIR/current"
chown -R lk:lk "$APP_DIR"
ls -1dt "$APP_DIR"/releases/* | tail -n +6 | xargs -r rm -rf

cat > /etc/systemd/system/nordsrub-lk.service <<UNIT
[Unit]
Description=Личный кабинет клиента
After=network.target

[Service]
User=lk
WorkingDirectory=$APP_DIR/current
EnvironmentFile=$ENV_FILE
Environment=NODE_ENV=production PORT=3000 HOSTNAME=127.0.0.1
ExecStart=/usr/bin/env node server.js
Restart=always

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable nordsrub-lk >/dev/null
systemctl restart nordsrub-lk

# nginx: свой сайт для поддомена, остальные сайты сервера не трогаем.
SITE=/etc/nginx/sites-available/nordsrub-lk
if [ ! -f "$SITE" ]; then
  cat > "$SITE" <<NGINX
server {
  listen 80;
  server_name $DOMAIN;
  client_max_body_size 50m;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX
  ln -sf "$SITE" /etc/nginx/sites-enabled/nordsrub-lk
fi
nginx -t
systemctl reload nginx

# HTTPS: только если задан email и сертификата ещё нет. Нужна DNS-запись поддомена на этот сервер.
if [ -n "$LE_EMAIL" ] && [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  command -v certbot >/dev/null || { apt-get update -q; apt-get install -yq certbot python3-certbot-nginx; }
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$LE_EMAIL" --redirect \
    || echo "Сертификат не выпущен: проверьте, что $DOMAIN указывает на этот сервер. Сайт работает по http."
fi

for i in $(seq 1 20); do
  curl -fsS -o /dev/null http://127.0.0.1:3000/login && { echo "Кабинет запущен"; exit 0; }
  sleep 1
done
journalctl -u nordsrub-lk -n 50 --no-pager
exit 1
