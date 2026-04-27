# syntax=docker/dockerfile:1.7
# ---------- Build stage ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /repo

# Copy workspace manifests first for layer caching.
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm ci --workspaces --include-workspace-root --no-audit --no-fund

# Copy source for shared + api
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared first, then the api
RUN npm run build:shared
RUN npm run build:api

# ---------- Runtime stage ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed to run.
COPY --from=builder /repo/package.json /repo/package-lock.json ./
COPY --from=builder /repo/apps/api/package.json ./apps/api/
COPY --from=builder /repo/packages/shared/package.json ./packages/shared/
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist

RUN npm ci --omit=dev --workspaces --include-workspace-root --no-audit --no-fund \
    && npm cache clean --force

EXPOSE 4000
USER node

CMD ["node", "apps/api/dist/server.js"]
