# syntax=docker/dockerfile:1
#
# React + Vite + TypeScript web app — multi-stage build for the Karmen monorepo.
# LOCAL-ONLY case study: no nginx, no registry, single-arch. The built app is
# served locally with `vite preview` (a tiny static server bundled with Vite).
#
# Build context is the REPO ROOT (see docker-compose.yml `build.context: .`) so
# the workspace-aware `npm ci` resolves against the root lockfile.
#
# Stages:
#   deps    -> install all workspace deps (root lockfile)
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
COPY package.json package-lock.json ./
COPY packages/web/package.json ./packages/web/package.json
COPY packages/api/package.json ./packages/api/package.json
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ---- Stage 2: build -------------------------------------------------------
FROM deps AS build
WORKDIR /repo
# Vite inlines VITE_* env at build time. Points at the API's published origin.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY packages/web ./packages/web
RUN npm run build --workspace=packages/web

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
# --host exposes preview outside the container; --port pins it.
CMD ["npm", "run", "preview", "--workspace=packages/web", "--", "--host", "0.0.0.0", "--port", "4173"]

# ---- Stage 4: dev (Vite dev server with HMR) ------------------------------
# Targeted by docker-compose.override.yml. Source bind-mounted at runtime.
FROM deps AS dev
ENV NODE_ENV=development
WORKDIR /repo/packages/web
EXPOSE 5173
# --host exposes the dev server outside the container.
CMD ["npm", "run", "dev", "--workspace=packages/web", "--", "--host", "0.0.0.0"]
