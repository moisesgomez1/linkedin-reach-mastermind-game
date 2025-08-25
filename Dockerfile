# ---------- Build stage ----------
FROM node:18 AS builder
WORKDIR /app

# Install deps using lockfile
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build:client && npm run build:server

# ---------- Runtime stage ----------
FROM node:18-slim
WORKDIR /app
ENV NODE_ENV=production

# Postgres client for wait script
RUN apt-get update \
 && apt-get install -y --no-install-recommends postgresql-client ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts and script
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build-server ./build-server
COPY --from=builder /app/server/docs ./server/docs
COPY --from=builder /app/wait-for-postgres.sh ./wait-for-postgres.sh
RUN chmod +x wait-for-postgres.sh

EXPOSE 3000
CMD ["./wait-for-postgres.sh", "db", "npm", "start"]
