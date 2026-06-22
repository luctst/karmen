# Karmen — Product Engineer Case Study

This repository holds my case study for the **Product Engineer** position at [Karmen](https://www.getkarmen.com/).

## About

A case study demonstrating product thinking and engineering execution: understanding the problem, shipping a focused solution, and explaining the trade-offs made along the way.

## Structure

```
.
├── README.md                              # You are here
├── CLAUDE.md                              # AI agent guidance
├── AGENTS.md                              # Agent routing guide
├── CADRAGE.md                             # Product framing
├── docker-compose.yml                     # Main compose config
├── docker-compose.override.yml.example    # Dev overrides template (copy to use)
├── .env.example                           # Environment template
├── Dockerfile                             # (see packages/api and packages/web)
├── packages/
│   ├── api/                               # NestJS backend
│   │   └── README.md
│   └── web/                               # React frontend
│       └── README.md
└── docs/                                  # Case study write-up, notes, decisions
```

## Onboarding

This section covers running the Karmen stack locally with Docker. For the complete contract, see `packages/api/README.md` and `packages/web/README.md`.

### Topology

The stack is a **containerized monorepo** with four services: **web** (React/Vite preview), **api** (NestJS), **db** (Postgres 16), and **migrate** (one-shot Prisma runner). Built and verified against Docker 25, BuildKit on (default), Compose v2 (`docker compose`, not `docker-compose`).

Single-arch, local-only setup. No nginx, no reverse proxy. Web and API run on **separate origins**; the SPA calls the API cross-origin via `VITE_API_BASE_URL`, and the API enables CORS for it.

```
                         host machine
   browser ──────────┬──────────────────┬─────────────┐
                     │                  │             │
            localhost:${WEB_PORT}  localhost:${API_PORT}  ...
                     ▼                  ▼
   ┌──────────────────────────────────────────────────────────┐
   │  karmen-net  (user-defined bridge — DNS by service name)  │
   │                                                            │
   │   ┌─────────────┐                 ┌──────────────┐        │
   │   │ web         │                 │ api          │        │
   │   │ vite:4173   │  ──cross-────>  │ nest:3000    │        │
   │   │ (SPA)       │    origin        │ (API)        │        │
   │   └─────────────┘    (CORS)        └──────┬───────┘        │
   │                                           │                │
   │   ┌─────────────┐                         │                │
   │   │ migrate     │      (one-shot)         ▼                │
   │   │ npx prisma  │                 ┌──────────────┐         │
   │   │ *migrate    │────┐             │ db           │         │
   │   │ *seed       │    │             │ postgres:5432│        │
   │   └─────────────┘    └────────────>│ vol: pgdata  │        │
   │                                    └──────────────┘        │
   └──────────────────────────────────────────────────────────┘

   web and api are both published to the host.
   db is internal (but exposed on DB_PORT for local SQL clients).
```

### Files

| File                                  | Role                                           |
|---------------------------------------|------------------------------------------------|
| `docker-compose.yml`                  | Complete stack (db, migrate, api, web)         |
| `docker-compose.override.yml.example` | Template for local hot-reload dev (copy it)    |
| `packages/api/Dockerfile`             | Multi-stage NestJS build (`migrate`/`runtime`) |
| `packages/web/Dockerfile`             | Multi-stage Vite build (`runtime`/`dev`)       |
| `.dockerignore`                       | Shrinks the root build context                 |
| `.env.example`                        | Env template (copy to `.env`)                  |

### First-time setup

```bash
cp .env.example .env
# edit .env — at minimum set a real PGPASSWORD
```

### Running the stack (default)

```bash
docker compose up --build           # build images + start all services
docker compose up -d --build        # detached
docker compose ps                   # health/status
docker compose logs -f api          # follow a service's logs
docker compose down                 # stop & remove containers (keeps data)
docker compose down -v              # delete pgdata volume (DESTROYS DB, re-seeds on next up)
```

Then open <http://localhost:8080> (or your `WEB_PORT`). The SPA will call the API at `http://localhost:3000` (or your `API_PORT`).

#### Bootstrap sequence

```
docker compose up --build
  1. db (postgres:16) starts → healthcheck: pg_isready
  2. migrate (one-shot) waits for db: service_healthy
     - runs `npx prisma migrate deploy` (applies committed migrations)
     - runs `npx prisma db seed` (seeds data via prisma/seed.ts)
     - exits 0
  3. api starts, waits for migrate: service_completed_successfully + db: service_healthy
  4. web starts, waits for api: service_healthy
```

To re-seed on a clean database:
```bash
docker compose down -v && docker compose up --build
```

### Development stack (hot reload)

```bash
cp docker-compose.override.yml.example docker-compose.override.yml
docker compose up --build
```

The real `docker-compose.override.yml` is gitignored; only the `.example` is committed. `docker compose` auto-merges the override on top of `docker-compose.yml`.

**Merge semantics:** The base file is not ignored — Compose deep-merges the two files. Scalars (e.g., `build.target`, `command`) are **replaced** by the override; mappings (e.g., `environment`) are **merged** key-by-key; sequences (e.g., `ports`, `volumes`) are **appended**. To inspect the fully-resolved merged config, run:

```bash
docker compose config
```

**What the override changes:**

- **api** and **web** build the `dev` Dockerfile target (watch mode, includes devDependencies)
- source is bind-mounted into the containers so edits trigger reloads without rebuilding
- `node_modules` is kept in an anonymous volume; the in-image install takes precedence over any host copy
- **web** runs the Vite dev server with HMR on `http://localhost:5173` (instead of the production preview on `4173`)
- **api** points `CORS_ORIGIN` to the dev server origin
- **db** and **migrate** run once, as in production

**Mount layout (dev):**
```
./packages/api  --(bind)-->  /repo/packages/api      (your code, live)
./packages/web  --(bind)-->  /repo/packages/web
anon volume     ----------->  /repo/node_modules      (in-image deps win)
```

**Required dev scripts:** The app packages must define these scripts for hot reload to work:
- **packages/api**: `npm run start:dev` (NestJS watch mode)
- **packages/web**: `npm run dev` (Vite dev server)

The `WEB_DEV_PORT` environment variable controls which port the dev server binds to (default `5173`). If you change it, also update `CORS_ORIGIN` in the override to match.

### Build context

Both Dockerfiles set `build.context: .` (the repo root), not the package dir. This is required for **npm workspaces**: `npm ci` needs the root `package.json` + `package-lock.json` to resolve the workspace. The Dockerfiles copy manifests first (cache-friendly), then source.

```
  cache-friendly layer order (api Dockerfile)
  ┌──────────────────────────────────────────┐
  │ COPY package.json package-lock.json       │  ← changes rarely
  │ COPY packages/*/package.json              │
  │ RUN npm ci                                │  ← cached unless deps change
  ├──────────────────────────────────────────┤
  │ COPY packages/api  (source)               │  ← changes often
  │ RUN npm run build                         │  ← re-runs on code change only
  └──────────────────────────────────────────┘
```

### Environment variables

Discrete Postgres variables are the **source of truth**; `DATABASE_URL` is derived for Prisma.

| Variable            | Source of truth       | Used by           | Default/Required |
|---------------------|----------------------|-------------------|------------------|
| `PGUSER`            | `.env`                | db, api, migrate  | `karmen`         |
| `PGPASSWORD`        | `.env`                | db, api, migrate  | **REQUIRED**     |
| `PGDATABASE`        | `.env`                | db, api, migrate  | `karmen`         |
| `PGHOST`            | compose (fixed)       | api, migrate      | `db` (in-network)|
| `PGPORT`            | compose (fixed)       | api, migrate      | `5432`           |
| `DATABASE_URL`      | assembled by compose  | api, migrate      | `postgres://PGUSER:PGPASSWORD@db:5432/PGDATABASE?schema=public` |
| `CORS_ORIGIN`       | `.env`                | api               | `http://localhost:8080` |
| `VITE_API_BASE_URL` | `.env` / build arg    | web (build-time)  | `http://localhost:3000` |
| `WEB_PORT`          | `.env`                | host→web:4173     | `8080`           |
| `WEB_DEV_PORT`      | `.env`                | host→web:5173     | `5173`           |
| `API_PORT`          | `.env`                | host→api:3000     | `3000`           |
| `DB_PORT`           | `.env`                | host→db:5432      | `5432`           |

### What each app package must provide

See `packages/api/README.md` and `packages/web/README.md` for the full contract. In short:

- **api**: `build` script, `start:dev` script, entrypoint at `dist/main.js`, a `GET /health` returning 200, reads `PORT`, `CORS_ORIGIN`, and discrete `PG*`/`DATABASE_URL` vars.
- **web**: `build` script, `dev` script, `vite build` → `dist/`, reads `VITE_API_BASE_URL` at build time, calls the API cross-origin.
- **migrate**: Runs `npx prisma migrate deploy && npx prisma db seed` as a one-shot before the api starts.

### Security notes

- API and Postgres are published to the host ports but rely on local-only binding.
- The API runtime image runs as the unprivileged `node` user.
- Secrets come from `.env` / runtime env — never baked into image layers.
  `.dockerignore` excludes `.env*` (except `.env.example`).
- Single-arch images; no registry push.

## Status

🚧 Work in progress.

---

_Author: [Lucas Tostée](https://github.com/luctst)_
