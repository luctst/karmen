# syntax=docker/dockerfile:1
# NestJS API multi-stage build. Build context is repo root for pnpm workspace resolution.

ARG NODE_VERSION=20

# Stage: deps (all deps, dev included)
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /repo

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN pnpm config set store-dir /pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/web/package.json ./packages/web/package.json

RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# Stage: build (compile TS)
FROM deps AS build
WORKDIR /repo
COPY packages/api ./packages/api
RUN pnpm --filter ./packages/api run build

# Stage: prod-deps (prod-only node_modules)
FROM node:${NODE_VERSION}-bookworm-slim AS prod-deps
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN pnpm config set store-dir /pnpm/store
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/web/package.json ./packages/web/package.json
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter ./packages/api --ignore-scripts

# Stage: runtime
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo/packages/api

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node --from=prod-deps /repo/node_modules /repo/node_modules
COPY --chown=node:node --from=prod-deps /repo/packages/api/node_modules ./node_modules
# Prisma client overlay from build stage (hardcoded path must match lockfile)
COPY --chown=node:node --from=build \
  /repo/node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma \
  /repo/node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma
COPY --chown=node:node --from=build     /repo/packages/api/dist ./dist
COPY --chown=node:node --from=build     /repo/packages/api/package.json ./package.json

USER node

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/main.js"]

# Stage: migrate (apply migrations + seed)
FROM deps AS migrate
ENV NODE_ENV=production
WORKDIR /repo
COPY packages/api ./packages/api
WORKDIR /repo/packages/api
RUN pnpm exec prisma generate
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm exec prisma db seed"]

# Stage: dev (hot reload)
FROM deps AS dev
ENV NODE_ENV=development
WORKDIR /repo/packages/api
ENV PORT=3000
EXPOSE 3000
CMD ["pnpm", "--filter", "@karmen/api", "run", "start:dev"]
