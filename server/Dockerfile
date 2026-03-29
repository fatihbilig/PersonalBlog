# Prisma 7.6+: Node 20.19+ veya 22.12+ veya 24+. Resmi 22.x imajı (≥22.12) Nixpacks'teki 20.18 / 22.11 tuzağından kaçınır.
FROM node:22-bookworm-slim
WORKDIR /app

COPY . .

RUN npm ci && npm run build

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
