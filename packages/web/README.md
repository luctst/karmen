# @karmen/web

The Karmen frontend — React + TypeScript, built with **Vite**, part of the npm-workspaces monorepo.

> **Source of truth for this package.** This README documents the contract that the Docker setup expects and the build/runtime environment. See the **Onboarding** section in the root `README.md` for topology and bootstrap flow.

## Scripts and build contract

`packages/web/package.json` must provide:

| Script  | Purpose                          | Used by           |
|---------|----------------------------------|-------------------|
| `build` | `vite build` → `dist/`           | Docker build stage |
| `dev`   | `vite --host 0.0.0.0` (HMR)     | docker-compose.override.yml |

The Docker build has two targets:
- `runtime`: runs `vite preview --host 0.0.0.0` on `:4173` (production-like local serve)
- `dev`: runs `vite --host 0.0.0.0 --port 5173` (dev server with HMR)

## Build and runtime contract

### Vite configuration
- **`vite build`** must emit to **`packages/web/dist`** (Vite default)
- The build is a **static SPA** — all routes must fall back to `index.html` for client-side routing

### Environment variables

**At build time:**
- Read **`VITE_API_BASE_URL`** (injected by compose via Docker build arg)
- Use this as the full API origin when making fetch requests to the API (e.g., `fetch(import.meta.env.VITE_API_BASE_URL + '/users')`)
- Default: `http://localhost:3000`

**At dev time:**
- The app will be served on `http://localhost:5173` (or your `WEB_DEV_PORT`)
- The API is on a **separate origin** (e.g., `http://localhost:3000`)
- Calls to the API are **cross-origin** — the API must enable CORS for the web origin

### Production serving

In production (`runtime` target), the app is served via `vite preview` (not nginx), which:
- Serves static `dist/` files on `:4173`
- Falls back to `index.html` for unmatched routes (SPA routing)
- Is reachable from the host on port `WEB_PORT` (default 8080)

The app calls the API at the origin specified in `VITE_API_BASE_URL` — **no reverse proxy**. The API must enable CORS for the web origin.

### Cross-origin API calls

The web app and API run on **separate origins**. All API fetch requests must:
- Use the full origin from `VITE_API_BASE_URL`
- Handle CORS errors if the API's `CORS_ORIGIN` does not match the web app's origin
- For local dev, ensure your `.env` has `CORS_ORIGIN=http://localhost:5173` (the dev server port) or `CORS_ORIGIN=http://localhost:8080` (the preview port)

## Build context

The Docker build uses the **repo root** as its context (not this directory), so the workspace `package.json` + `package-lock.json` can be resolved during `npm ci`. See the `Dockerfile` header and the **Build context** subsection in the root `README.md`'s Onboarding section for details.
