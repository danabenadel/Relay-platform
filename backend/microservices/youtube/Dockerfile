# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Expose port
EXPOSE 5008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5008/health || exit 1

# Start the service
CMD ["node", "dist/index.js"]
