#!/bin/bash

# -----------------------------
# 🚀 Full Safe Deployment Script (MERN/PERN)
# -----------------------------

# Set project root
cd /var/www/humber/humber-updated || exit 1
PROJECT_ROOT=$(pwd)
echo "📌 Project root: $PROJECT_ROOT"

# Step 1: Pull latest code
echo "📌 Pulling latest code from GitHub..."
git fetch origin main
git reset --hard origin/main
echo "✅ Latest code pulled."

# Step 2: Stop old project containers
echo "📌 Stopping project containers..."
docker stop nextjs_frontend node_backend 2>/dev/null || true
docker rm nextjs_frontend node_backend 2>/dev/null || true
echo "✅ Containers stopped (other containers safe)."

# Step 3: Ensure uploads folder exists
UPLOADS_DIR="./backend/uploads"
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "⚠️ 'uploads' folder missing! Creating..."
    mkdir -p "$UPLOADS_DIR"
    chmod 775 "$UPLOADS_DIR"
else
    echo "✅ 'uploads' folder exists, safe."
fi

# Step 4: Install frontend dependencies & build
echo "📌 Cleaning frontend build cache..."
rm -rf ./frontend/node_modules ./frontend/.next
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..
echo "✅ Frontend dependencies installed and built."

# Step 5: Install backend dependencies & build
echo "📌 Cleaning backend node_modules..."
rm -rf ./backend/node_modules ./backend/dist
cd backend
npm install
npm run build
cd ..
echo "✅ Backend dependencies installed and TypeScript compiled."

# Step 6: Remove old Docker images (optional, avoids caching issues)
echo "📌 Removing old Docker images..."
docker rmi nextjs_frontend node_backend 2>/dev/null || true
echo "✅ Old Docker images removed."

# Step 7: Build & start backend container
echo "📌 Building and starting backend container..."
docker compose build --no-cache backend
docker compose up -d backend
echo "✅ Backend started."

# Step 8: Build & start frontend container
echo "📌 Building and starting frontend container..."
docker compose build --no-cache frontend
docker compose up -d frontend
echo "✅ Frontend started."

# Step 9: Show active project containers
echo "📌 Active project containers:"
docker ps --filter "name=nextjs_frontend" --filter "name=node_backend"

# Step 10: Show logs (last 50 lines)
echo "----------------------------------------"
echo "📄 Backend logs (last 50 lines)"
echo "----------------------------------------"
docker logs node_backend --tail=50

echo "----------------------------------------"
echo "📄 Frontend logs (last 50 lines)"
echo "----------------------------------------"
docker logs nextjs_frontend --tail=50

echo "----------------------------------------"
echo "✅ Deployment finished successfully!"
echo "----------------------------------------"