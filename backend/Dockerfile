FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma/ ./prisma/
COPY swagger.yaml ./swagger.yaml 

RUN npm ci

RUN npm install --save-dev @types/swagger-ui-express @types/yamljs

RUN npx prisma generate

COPY src/ ./src/

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/swagger.yaml ./swagger.yaml

RUN npm ci --only=production && npm cache clean --force

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts || echo 'Seed failed or already applied' && npm start"]
