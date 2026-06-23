# syntax=docker/dockerfile:1
#
# React + Vite + TypeScript web app — multi-stage build for the Karmen monorepo.
# LOCAL-ONLY case study: no nginx, no registry, single-arch. The built app is
# served locally with `vite preview` (a tiny static server bundled with Vite).
#
# Build context is the REPO ROOT (see docker-compose.yml `build.context: .`) so
# the workspace-aware `pnpm install` resolves against the root lockfile
# (pnpm-lock.yaml) and workspace definition (pnpm-workspace.yaml).
#
# pnpm is provisioned via corepack and pinned to the same version as the root
# package.json `packageManager` field (pnpm@10.32.1).
#
# Stages:
#   deps    -> install all workspace deps from the root lockfile
#   build   -> `vite build` -> static assets in packages/web/dist
#   runtime -> `vite preview` serving dist/ on :4173
#   dev     -> `vite` dev server with HMR on :5173
#
# What the app (packages/web) MUST provide for this to build:
#   - packages/web/package.json with:
#       * "build" script (Vite default: `vite build`) -> packages/web/dist
#       * "preview" script (Vite default: `vite preview`)
#       * "dev" script (Vite default: `vite`)
#   - The SPA calls the API at import.meta.env.VITE_API_BASE_URL, which points
#     at the API's published host port (separate origin — no reverse proxy).
#     CORS must be enabled on the API for the web origin.
#
# ---------------------------------------------------------------------------

ARG NODE_VERSION=20

# ---- Stage 1: deps --------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /repo

# Enable pnpm through corepack, pinned to the root package.json
# `packageManager` version. Keep this in sync if you bump pnpm.
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Stable store path so the BuildKit cache mount (target=/pnpm/store) matches
# where pnpm writes its content-addressable store.
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN pnpm config set store-dir /pnpm/store

# Root manifests + lockfile + workspace definition first (cached unless deps
# change), then every per-workspace manifest the lockfile references so pnpm
# can resolve the full workspace graph.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/web/package.json ./packages/web/package.json
COPY packages/api/package.json ./packages/api/package.json
# web depends on @karmen/ui (workspace:*) — its manifest must be present so the
# frozen install can resolve the full workspace graph from the lockfile.
COPY packages/ui/package.json ./packages/ui/package.json

# Install strictly from the committed lockfile (CI/prod-safe, like `npm ci`).
# BuildKit cache mount keeps pnpm's store warm without baking it into a layer.
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Stage 2: build -------------------------------------------------------
FROM deps AS build
WORKDIR /repo
# Vite inlines VITE_* env at build time. Points at the API's published origin.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY packages/web ./packages/web
# @karmen/ui is consumed as SOURCE (its exports map points at ./src/*.tsx and
# globals.css does `@source "../../../ui/src/**"`), so the ui source must be
# present for vite to import it and for the Tailwind @source scan to find it.
COPY packages/ui ./packages/ui
# --filter targets the web workspace BY PATH (subpackage names are future
# contracts and not defined yet) — run its "build" script.
RUN pnpm --filter ./packages/web run build

# ---- Stage 3: runtime (vite preview, local static server) -----------------
# `vite preview` serves the production build on port 4173. Lightweight and
# perfectly fine for a local-only case study. The build is already minified.
FROM deps AS runtime
ENV NODE_ENV=production
WORKDIR /repo/packages/web
# Carry over the compiled assets from the build stage.
COPY --from=build /repo/packages/web/dist ./dist
USER node
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:4173/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"
# --host exposes preview outside the container; --port pins it. Args after the
# script name pass straight to `vite preview` (no `--` separator needed with
# pnpm run). --filter targets the workspace BY NAME: a path filter (./packages/web)
# is resolved relative to the WORKDIR above (/repo/packages/web), so it would look
# for a non-existent nested path and match no projects. The name is now defined.
CMD ["pnpm", "--filter", "@karmen/web", "run", "preview", "--host", "0.0.0.0", "--port", "4173"]

# ---- Stage 4: dev (Vite dev server with HMR) ------------------------------
# Targeted by docker-compose.override.yml. Source bind-mounted at runtime.
FROM deps AS dev
ENV NODE_ENV=development
WORKDIR /repo/packages/web
EXPOSE 5173
# --host exposes the dev server outside the container. Args after the script
# name pass straight to `vite`. --filter targets the workspace BY NAME (a path
# filter would resolve relative to the WORKDIR and match no projects — see the
# runtime stage note). The name is now defined.
CMD ["pnpm", "--filter", "@karmen/web", "run", "dev", "--host", "0.0.0.0"]
