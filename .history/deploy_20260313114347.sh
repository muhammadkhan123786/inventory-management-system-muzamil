#!/bin/bash

PROJECT_NAME="inventory-management-system-muzamil"
PROJECT_PATH="/var/www/inventory-management-system-muzamil"

cd $PROJECT_PATH || exit 1

echo "🚀 Deploying $PROJECT_NAME"

echo "📌 Pulling latest code..."
git fetch origin main
git reset --hard origin/main

echo "📌 Stopping old containers..."
docker compose down

echo "📌 Building containers..."
docker compose build --no-cache

echo "📌 Starting containers..."
docker compose up -d

echo "📌 Running containers:"
docker ps

echo "----------------------------------------"
echo "📄 Backend logs"
docker compose logs backend --tail=50

echo "----------------------------------------"
echo "📄 Frontend logs"
docker compose logs frontend --tail=50

echo "----------------------------------------"
echo "✅ Deployment completed!"