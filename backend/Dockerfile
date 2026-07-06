FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY install-agent.sh ./public/install-agent.sh
EXPOSE 8006
CMD ["sh", "-c", "npx prisma migrate deploy && npx ts-node prisma/seed.ts || true; node dist/main.js"]
