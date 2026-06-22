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
├── packages/
│   ├── api/                               # NestJS backend
│   │   ├── Dockerfile
│   │   └── README.md
│   ├── web/                               # React frontend
│   │   ├── Dockerfile
│   │   └── README.md
│   └── ui/                                # @karmen/ui — shared shadcn/ui component library
│       └── README.md
└── docs/                                  # Case study write-up, notes, decisions
```

## Onboarding

Four containerized services (Docker 25, Compose v2): **web** (React/Vite), **api** (NestJS), **db** (Postgres 16), **migrate** (one-shot Prisma runner). Local-only, separate origins, CORS enabled. For full package contracts, see `packages/api/README.md` and `packages/web/README.md`. Shared UI components live in `packages/ui` (`@karmen/ui`) — see `packages/ui/README.md`.

### First-time setup

```bash
cp .env.example .env
# edit .env — set a real PGPASSWORD
```

### Running the stack

```bash
docker compose up --build       # build & start all services
docker compose ps               # check health
docker compose logs -f api      # follow logs
docker compose down             # stop (keeps data)
docker compose down -v          # delete DB volume (DESTROYS DB, re-seeds on next up)
```

Open <http://localhost:8080> (or your `WEB_PORT`). The SPA calls the API at `http://localhost:3000` (or `API_PORT`).

**Bootstrap order:**
1. db starts + health check passes
2. migrate waits for db, runs `prisma migrate deploy` + `prisma db seed`, exits
3. api starts, waits for migrate + db
4. web starts, waits for api

### Development (hot reload)

```bash
cp docker-compose.override.yml.example docker-compose.override.yml
docker compose up --build
```

The override is auto-merged by Compose (see `docker compose config` for the resolved config). Dev mode uses the `dev` Dockerfile target with bind-mounted code and live reload:
- **api**: NestJS watch mode + hot reload (runs `start:dev`)
- **web**: Vite HMR on port 5173 (runs `dev`)
- **db** + **migrate**: unchanged

### Environment variables

Discrete Postgres variables are the **source of truth**; `DATABASE_URL` is derived.

| Variable            | Source          | Used by        | Default/Required |
|---------------------|-----------------|----------------|------------------|
| `PGUSER`            | `.env`          | db, api        | `karmen`         |
| `PGPASSWORD`        | `.env`          | db, api        | **REQUIRED**     |
| `PGDATABASE`        | `.env`          | db, api        | `karmen`         |
| `PGHOST`            | compose         | api            | `db`             |
| `PGPORT`            | compose         | api            | `5432`           |
| `DATABASE_URL`      | auto-assembled  | api            | `postgres://PGUSER:PGPASSWORD@db:5432/PGDATABASE?schema=public` |
| `CORS_ORIGIN`       | `.env`          | api            | `http://localhost:8080` |
| `VITE_API_BASE_URL` | `.env`          | web (build)    | `http://localhost:3000` |
| `WEB_PORT`          | `.env`          | host→web       | `8080`           |
| `WEB_DEV_PORT`      | `.env`          | host→web (dev) | `5173`           |
| `API_PORT`          | `.env`          | host→api       | `3000`           |
| `DB_PORT`           | `.env`          | host→db (opt-in, override only) | `5432`           |

### Notes

- Both images build from repo root (needed for pnpm workspaces).
- API runtime image runs as unprivileged `node` user.
- Secrets from `.env` only, never in layers.
- Single-arch, local-only.

## Status

🚧 Work in progress.

---

_Author: [Lucas Tostée](https://github.com/luctst)_
