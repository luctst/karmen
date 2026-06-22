# syntax=docker/dockerfile:1
#
# NestJS API — multi-stage build for the Karmen monorepo (npm workspaces).
#
# Build context is the REPO ROOT (see docker-compose.yml `build.context: .`),
# NOT packages/api. This is required so the workspace-aware `npm ci` can see the
# root package.json + package-lock.json and resolve the workspace correctly.
#
# Stages:
#   deps     -> install ALL deps (incl. dev) using the root lockfile
#   build    -> compile TypeScript -> dist/
#   prod-deps-> install ONLY production deps (smaller node_modules)
#   runtime  -> distro-slim image that ships dist/ + prod node_modules
#
# What the app (packages/api) MUST provide for this to build & run:
#   - packages/api/package.json with:
#       * "build" script that emits to packages/api/dist (NestJS default: `nest build`)
#       * "start:prod" OR a main at dist/main.js
#       * "start:dev" (NestJS watch) for the dev target
#       * dependency @nestjs/*, @prisma/client; devDependency prisma
#       * Prisma seed hook. With prisma.config.ts:
#             migrations: { seed: "tsx prisma/seed.ts" }
#         (or the legacy package.json "prisma": { "seed": "..." } key)
#   - packages/api/prisma/schema.prisma whose datasource reads env("DATABASE_URL").
#   - packages/api/prisma/seed.ts that seeds mock/initial data (idempotent).
#   - A GET /health endpoint returning 200 (used by the HEALTHCHECK below).
#   - It reads the DB connection from DATABASE_URL. The compose file builds that
#     URL from the discrete PG* vars (the source of truth) — see docker-compose.yml.
#
# Targets:
#   runtime -> the API service (slim, prod deps only)
#   migrate -> one-shot: `prisma migrate deploy && prisma db seed` (needs the
#              Prisma CLI + schema + seed source, i.e. the full `deps` tree)
#   dev     -> NestJS watch mode for local development
#
# ---------------------------------------------------------------------------

ARG NODE_VERSION=20

# ---- Stage 1: deps (full dependency tree, dev included) -------------------
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /repo

# Copy only the manifests first so this layer is cached unless deps change.
# Root manifests drive the npm workspace.
COPY package.json package-lock.json ./
# Per-workspace manifests. Add more COPY lines here if you add packages
# that the API depends on at build time.
COPY packages/api/package.json ./packages/api/package.json
COPY packages/web/package.json ./packages/web/package.json

# Install the whole workspace. BuildKit cache mount keeps npm's cache warm
# across builds without baking it into a layer.
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ---- Stage 2: build (compile TS) ------------------------------------------
FROM deps AS build
WORKDIR /repo
# Now bring in the API source. Code changes only invalidate from here down.
COPY packages/api ./packages/api
# Generate the Prisma client (no DB connection needed) so it is bundled into
# node_modules before the TS build references it. No-op if the app has no
# schema yet; the app MUST provide packages/api/prisma/schema.prisma.
RUN npm run build --workspace=packages/api

# ---- Stage 3: prod-deps (production-only node_modules) --------------------
FROM node:${NODE_VERSION}-bookworm-slim AS prod-deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/web/package.json ./packages/web/package.json
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --workspace=packages/api --include-workspace-root

# ---- Stage 4: runtime -----------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Drop privileges. The node image ships an unprivileged `node` user.
# Copy artifacts with correct ownership.
COPY --chown=node:node --from=prod-deps /repo/node_modules ./node_modules
COPY --chown=node:node --from=build     /repo/packages/api/dist ./dist
COPY --chown=node:node --from=build     /repo/packages/api/package.json ./package.json

USER node

# The API listens on PORT (default 3000). Override via env.
ENV PORT=3000
EXPOSE 3000

# Healthcheck hits the /health endpoint the app must expose.
# Uses node's built-in http (no curl in slim image) to stay dependency-free.
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Run the compiled entrypoint. NestJS default emits dist/main.js.
CMD ["node", "dist/main.js"]

# ---- Stage 5: migrate (one-shot: apply migrations + seed) -----------------
# Run by the `migrate` compose service after the db is healthy, before the api
# starts. Needs the Prisma CLI (devDep) + schema + seed source, so it builds on
# the full `deps` stage rather than the slim prod tree.
#
# Flow on `up`:  db healthy  ->  prisma migrate deploy  ->  prisma db seed  ->  api starts
#
# `migrate deploy` applies committed migrations non-interactively (CI/prod-safe).
# `db seed` runs the seed hook the app defines (idempotent seed expected).
FROM deps AS migrate
ENV NODE_ENV=production
WORKDIR /repo
# Bring in the API source (prisma/schema.prisma, prisma/seed.ts, migrations).
COPY packages/api ./packages/api
WORKDIR /repo/packages/api
# Prisma reads DATABASE_URL from the environment (injected by compose).
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed"]

# ---- Stage 6: dev (hot reload) --------------------------------------------
# Targeted by docker-compose.override.yml for local development.
# Source is bind-mounted at runtime; node_modules come from the image.
FROM deps AS dev
ENV NODE_ENV=development
WORKDIR /repo/packages/api
ENV PORT=3000
EXPOSE 3000
# `start:dev` is the NestJS watch-mode script. The app must define it.
CMD ["npm", "run", "start:dev", "--workspace=packages/api"]
