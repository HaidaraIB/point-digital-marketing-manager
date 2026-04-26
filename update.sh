#!/usr/bin/env bash
# Pull latest from GitHub and redeploy the Vite frontend (see DEPLOY.md §7).
# Run on the VPS from the repo root, or from anywhere: ./update.sh
# Typical path: /var/www/point-digital-marketing-manager/update.sh

echo "[update] npm ci"
npm ci

echo "[update] npm run build"
npm run build

echo "[update] reload nginx"
sudo systemctl reload nginx

echo "[update] Done."
