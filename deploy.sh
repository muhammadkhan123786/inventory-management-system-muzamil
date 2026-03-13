#!/bin/bash

# -----------------------------
# 🚀 Deployment Script (Inventory Project)
# -----------------------------

# Set project root
cd /var/www/inventory-management-system-muzamil || exit 1
PROJECT_ROOT=$(pwd)
echo "📌 Project root: $PROJECT_ROOT"

# Step 1: Pull latest code
echo "📌 Pulling latest code..."
git fetch origin main
git reset --hard origin/main
echo "✅ Latest code pulled."

# Step 2: Stop old containers
echo "📌 Stopping old containers..."
docker stop inventory_backend inventory_frontend inventory_mongo 2>/dev/null || true
docker rm inventory_backend inventory_frontend inventory_mongo 2>/dev/null || true
echo "✅ Containers stopped."

# Step 3: Ensure uploads folder exists
UPLOADS_DIR="./backend/uploads"
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "⚠️ Creating uploads folder..."
    mkdir -p "$UPLOADS_DIR"
    chmod 775 "$UPLOADS_DIR"
else
    echo "✅ Uploads folder exists."
fi

# Step 4: Build & start containers
echo "📌 Building and starting containers..."
docker compose build --no-cache
docker compose up -d
echo "✅ Containers started."

# Step 5: Show active containers
echo "📌 Active containers:"
docker ps --filter "name=inventory"

# Step 6: Show backend logs (last 50 lines)
echo "----------------------------------------"
echo "📄 Backend logs (last 50 lines)"
echo "----------------------------------------"
docker logs inventory_backend --tail=50

echo "----------------------------------------"
echo "✅ Deployment finished successfully!"
echo "----------------------------------------"