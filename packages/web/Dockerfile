# syntax=docker/dockerfile:1
# React + Vite web app multi-stage build. Build context is repo root for pnpm workspace resolution.

ARG NODE_VERSION=20

# Stage: deps
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN pnpm config set store-dir /pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/web/package.json ./packages/web/package.json
COPY packages/api/package.json ./packages/api/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Stage: build
FROM deps AS build
WORKDIR /repo
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY packages/web ./packages/web
COPY packages/ui ./packages/ui
RUN pnpm --filter ./packages/web run build

# Stage: runtime (vite preview)
FROM deps AS runtime
ENV NODE_ENV=production
WORKDIR /repo/packages/web
COPY --from=build /repo/packages/web/dist ./dist
USER node
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:4173/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"
CMD ["pnpm", "--filter", "@karmen/web", "run", "preview", "--host", "0.0.0.0", "--port", "4173"]

# Stage: dev (Vite dev server with HMR)
FROM deps AS dev
ENV NODE_ENV=development
WORKDIR /repo/packages/web
EXPOSE 5173
CMD ["pnpm", "--filter", "@karmen/web", "run", "dev", "--host", "0.0.0.0"]
