FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/

# Install deps
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps

# Copy source code
WORKDIR /app
COPY frontend ./frontend
COPY common ./common

# Build Next.js
WORKDIR /app/frontend
RUN npm run build --webpack

EXPOSE 3000

CMD ["npm", "run", "start"]
