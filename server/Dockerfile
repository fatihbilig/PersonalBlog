# Prisma 7.6+ Nixpacks'in nodejs_22 (22.11) sürümünü reddeder; resmi Node 20 LTS kullanılır.
FROM node:20-bookworm-slim
WORKDIR /app

COPY . .

RUN npm ci && npm run build

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
