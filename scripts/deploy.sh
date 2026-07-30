#!/bin/bash
# ============================================================
# NEWGEN STORE — Production Deployment Script
# Usage: bash scripts/deploy.sh
# ============================================================

set -e

APP_DIR="/var/www/newgen-store"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     NEWGEN STORE — Deploy Script       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Go to app directory
cd $APP_DIR

echo "▶ Pulling latest code..."
git pull origin main

echo "▶ Installing dependencies..."
npm install --production=false

echo "▶ Generating Prisma client..."
npx prisma generate

echo "▶ Syncing database schema..."
npx prisma db push

echo "▶ Building Next.js application..."
npm run build

echo "▶ Restarting app..."
pm2 restart newgen-store

echo ""
echo "✅ Deployment complete!"
echo "🌐 App running on port 3020"
echo ""
