#!/bin/bash
# ============================================================
# BYASHARA STORE — Production Deployment Script
# Usage: bash scripts/deploy.sh
# ============================================================

set -e

APP_DIR="/var/www/byashara-store"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     BYASHARA STORE — Deploy Script       ║"
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

echo "▶ Running database migrations..."
npx prisma migrate deploy

echo "▶ Building Next.js application..."
npm run build

echo ""
echo "✅ Deployment complete!"
echo "🌐 App running on port 3000"
echo ""
