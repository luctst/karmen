# syntax=docker/dockerfile:1
#
# NestJS API — multi-stage build for the Karmen monorepo (pnpm workspaces).
#
# Build context is the REPO ROOT (see docker-compose.yml `build.context: .`),
# NOT packages/api. This is required so the workspace-aware `pnpm install` can
# see the root package.json + pnpm-lock.yaml + pnpm-workspace.yaml and resolve
# the workspace correctly.
#
# pnpm is provisioned via corepack and pinned to the same version as the root
# package.json `packageManager` field (pnpm@10.32.1).
#
# Stages:
#   deps     -> install ALL deps (incl. dev) from the root lockfile
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

# Prisma's query engine dynamically links libssl; the slim image omits it,
# which triggers `prisma:warn ... failed to detect the libssl/openssl version`
# and a fallback to the wrong (openssl-1.1.x) engine. Installing openssl lets
# Prisma resolve the correct debian-openssl-3.0.x engine on bookworm. This
# stage backs `migrate` and `dev`, which both run Prisma. (Cleaned in-layer.)
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm through corepack, pinned to the same version as the root
# package.json `packageManager` field. Keep this in sync if you bump pnpm.
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Put the pnpm content-addressable store on a stable path so the BuildKit
# cache mount below (target=/pnpm/store) lines up with where pnpm writes.
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN pnpm config set store-dir /pnpm/store

# Copy only the manifests first so this layer is cached unless deps change.
# Root manifests + lockfile + workspace definition drive the pnpm workspace.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Per-workspace manifests. Copy every package the lockfile references so pnpm
# can resolve the full workspace graph from the frozen lockfile. Add more COPY
# lines here if you add packages the API depends on at build time.
COPY packages/api/package.json ./packages/api/package.json
COPY packages/web/package.json ./packages/web/package.json

# Install the whole workspace strictly from the committed lockfile.
# --frozen-lockfile fails (rather than mutating the lockfile) if it is out of
# sync — the CI/prod-safe equivalent of `npm ci`. The BuildKit cache mount
# keeps pnpm's store warm across builds without baking it into a layer.
# --ignore-scripts skips lifecycle hooks: the root `prepare` runs `husky` (git
# hook setup) which is meaningless in an image and absent in a --prod tree. We
# run `prisma generate` explicitly (build + migrate stages), so no dependency
# postinstall is relied upon here either.
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# ---- Stage 2: build (compile TS) ------------------------------------------
FROM deps AS build
WORKDIR /repo
# Now bring in the API source. Code changes only invalidate from here down.
COPY packages/api ./packages/api
# Generate the Prisma client (no DB connection needed) so it is bundled into
# node_modules before the TS build references it. No-op if the app has no
# schema yet; the app MUST provide packages/api/prisma/schema.prisma.
# --filter targets the workspace BY PATH (the subpackage names are future
# contracts and not defined yet) — run its "build" script.
RUN pnpm --filter ./packages/api run build

# ---- Stage 3: prod-deps (production-only node_modules) --------------------
# Fresh slim base (not built on `deps`) so dev deps never leak in. Re-provision
# pnpm via corepack, then install production-only deps for just the API.
FROM node:${NODE_VERSION}-bookworm-slim AS prod-deps
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN pnpm config set store-dir /pnpm/store
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/web/package.json ./packages/web/package.json
# --prod skips devDependencies; --filter scopes the install to the API
# workspace BY PATH (subpackage names are future contracts, not defined yet).
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter ./packages/api --ignore-scripts

# ---- Stage 4: runtime -----------------------------------------------------
# IMPORTANT: we mirror the /repo workspace layout instead of flattening to /app.
# pnpm uses an isolated node_modules: the API's direct deps live as symlinks in
# packages/api/node_modules/* -> ../../../../node_modules/.pnpm/<pkg>. Those
# relative links only resolve if the repo-root node_modules AND the per-package
# node_modules keep their relative distance. Flattening would break `require()`
# (e.g. Cannot find module '@nestjs/common'). WORKDIR is the API package; the
# entrypoint is still dist/main.js relative to it (contract preserved).
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo/packages/api

# Prisma's query engine needs libssl at runtime too (see the deps stage note).
# Without it the engine warns and loads the wrong target. (Cleaned in-layer.)
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Drop privileges. The node image ships an unprivileged `node` user. Copy the
# pnpm virtual store (repo-root node_modules) AND the API package's symlink tree,
# preserving their relative positions so the symlinks resolve.
COPY --chown=node:node --from=prod-deps /repo/node_modules /repo/node_modules
COPY --chown=node:node --from=prod-deps /repo/packages/api/node_modules ./node_modules
# prod-deps runs `pnpm install` only — it never runs `prisma generate`, so the
# generated client is absent and the API would crash on its first Prisma query.
# Under pnpm's isolated layout the client is generated INTO the virtual store,
# beside the @prisma/client package the workspace symlinks resolve to:
#   node_modules/.pnpm/@prisma+client@<ver+peerhash>/node_modules/.prisma
# Overlay just that generated `.prisma` from `build` (DRY: reuse build's generate
# output — incl. the debian-openssl-3.0.x engine — rather than re-provisioning
# pnpm + schema on this slim base). The .pnpm dir name is lockfile-pinned, so it
# is byte-identical in prod-deps; this hardcoded path is the maintenance contract
# (update it if the lockfile's @prisma/client peer set changes).
COPY --chown=node:node --from=build \
  /repo/node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma \
  /repo/node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma
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
# Generate the Prisma client at build time (cached layer). `deps` is install-only
# and never ran generate, so without this the seed's `new PrismaClient()` throws
# `Cannot find module '.prisma/client/default'`. `generate` reads the schema only
# — no DB connection needed — so it is safe here, before the DB exists.
RUN pnpm exec prisma generate
# Prisma reads DATABASE_URL from the environment (injected by compose).
# `pnpm exec` runs the workspace-local Prisma CLI binary (resolved from the
# deps tree) — the pnpm equivalent of `npx`.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm exec prisma db seed"]

# ---- Stage 6: dev (hot reload) --------------------------------------------
# Targeted by docker-compose.override.yml for local development.
# Source is bind-mounted at runtime; node_modules come from the image.
FROM deps AS dev
ENV NODE_ENV=development
WORKDIR /repo/packages/api
ENV PORT=3000
EXPOSE 3000
# `start:dev` is the NestJS watch-mode script. Filter by package NAME — a path
# filter would resolve relative to this WORKDIR (/repo/packages/api) and match nothing.
CMD ["pnpm", "--filter", "@karmen/api", "run", "start:dev"]
