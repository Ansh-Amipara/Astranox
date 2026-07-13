# -----------------------
# Stage 1: Build
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Copy root workspace configurations
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.json ./

# Copy packages
COPY packages/shared packages/shared
COPY server server

# Install all dependencies (we need devDependencies for building)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
WORKDIR /app/server
RUN pnpm prisma generate

# Build server and shared packages
WORKDIR /app
RUN pnpm --filter @astranox/shared build
RUN pnpm --filter astranox-server build

# -----------------------
# Stage 2: Production Dependencies
# -----------------------
FROM node:20-alpine AS pruner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY server/package.json server/

# Only install production dependencies
RUN pnpm install --prod --frozen-lockfile

# -----------------------
# Stage 3: Runner
# -----------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy prod modules
COPY --from=pruner /app/node_modules ./node_modules
COPY --from=pruner /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=pruner /app/server/node_modules ./server/node_modules

# Copy built code and required assets
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/public ./server/public
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/prisma ./server/prisma

# Expose port
EXPOSE 3000

# Start server
WORKDIR /app/server
CMD ["node", "dist/server.js"]
