# -----------------------
# Stage 1: Build
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Copy root workspace configurations
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.json ./

# Copy packages
COPY packages/shared packages/shared
COPY client client

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build client (and shared since it's a dependency)
WORKDIR /app
RUN pnpm --filter @astranox/shared build
RUN pnpm --filter client build

# -----------------------
# Stage 2: Nginx Runner
# -----------------------
FROM nginx:alpine

# Copy custom nginx config if you have one, or just use default
# COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
