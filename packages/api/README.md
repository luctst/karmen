# @karmen/api

The Karmen backend API — NestJS (TypeScript) with Prisma ORM, part of the npm-workspaces monorepo.

> **Source of truth for this package.** This README documents the contract that the Docker setup expects and the runtime environment the API runs in. See the **Onboarding** section in the root `README.md` for topology and bootstrap flow.

## Scripts and build contract

`packages/api/package.json` must provide:

| Script      | Purpose                                | Used by                    |
|-------------|----------------------------------------|----------------------------|
| `build`     | Compile TS → `dist/` (e.g. `nest build`) | Docker build stage (prod)  |
| `start:dev` | NestJS watch mode (e.g. `nest start --watch`) | docker-compose.override.yml |

The Docker build has two targets:
- `migrate`: runs `npx prisma migrate deploy && npx prisma db seed` then exits (one-shot seed service)
- `runtime`: runs `node dist/main.js` (the main API)

## Runtime contract

The API entrypoint must be at **`dist/main.js`** and must:

### Environment variables
- Read **`PORT`** (defaults to 3000) and listen on all interfaces
- Read **`CORS_ORIGIN`** and enable CORS for that origin (e.g. the web app's origin)
- Read **database connection vars**:
  - `DATABASE_URL` is preferred (`postgres://user:pass@db:5432/dbname?schema=public`)
  - Prisma's `prisma/schema.prisma` should have `datasource db { url = env("DATABASE_URL") }`
  - Additionally, discrete `PG*` vars are available in the environment if needed: `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGHOST`, `PGPORT`

### Endpoints
- Expose a **`GET /health`** endpoint returning HTTP **200 OK** — the container healthcheck and compose `depends_on: service_healthy` rely on it

### Database and seeding

`packages/api/package.json` must include:
- `@prisma/client` as a **dependency** (runtime)
- `prisma` as a **devDependency** (build-time for schema compilation and migrations)
- `tsx` or `ts-node` as a devDependency (to run the seed)

You must provide:
- **`packages/api/prisma/schema.prisma`** — Prisma schema with `datasource db { url = env("DATABASE_URL") }`
- **`packages/api/prisma/seed.ts`** — idempotent seed script (runs after every migration deploy; if no data is needed, use an empty stub)
- **Seed hook configuration** in either:
  - `prisma.config.ts`: `export const prismaConfig = { migrations: { seed: "tsx prisma/seed.ts" } }`
  - OR legacy `package.json`: `"prisma": { "seed": "tsx prisma/seed.ts" }`

The seed runs once automatically when the stack boots (via the `migrate` service). To reseed a clean database:
```bash
docker compose down -v && docker compose up --build
```

## Build context

The Docker build uses the **repo root** as its context (not this directory), so the workspace `package.json` + `package-lock.json` can be resolved during `npm ci`. See the `Dockerfile` header and the **Build context** subsection in the root `README.md`'s Onboarding section for details.
