FROM node:20-alpine

WORKDIR /app/backend

# Muzamil Start
# 1. Install Chromium and dependencies needed for Alpine
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# 2. Tell Puppeteer to skip downloading its own browser (save space)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

    # Muzamil End
# Copy only package files first (cache-friendly)
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps


# Copy ALL source code AFTER deps
COPY backend ./
COPY common ../common

# 🔥 Force clean build
RUN rm -rf dist && npm run build

EXPOSE 8081

CMD ["node", "dist/backend/src/server.js"]
