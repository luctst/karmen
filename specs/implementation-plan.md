# Implementation Plan — Karmen Analyst App (Étapes 1→3)

> Build plan derived from `specs/design-plan.md` + `DESIGN.md`. Scope: Complétude, Score, Analyse Financière (v0+v1). Calibrates against the resolved design decisions (Q1 override, Q6 static confidence, Q8 hard score floor).

## Overview
A desktop analyst web app where a credit analyst triages dossiers and reviews them by exception. The backend (NestJS + Prisma + Postgres) serves **pre-computed, seeded** dossiers — no eval engine, no DSP2; connection states, scores, anomalies, mitigants and pre-assessment text are all seeded. **Mutations persist**: annotations, overrides, checklist toggles, pre-assessment edits, validate, request-info, and hidden-account dispositions all write to the DB and an audit log. The React/Vite frontend (consuming `@karmen/ui`) is the showcase, built as vertical slices behind a Queue + Workspace frame.

## Architecture Decisions
- **Seeded fixtures, not an eval engine.** The DB stores final verdicts; the API reads and mutates them. Rationale: the design/product story is the deliverable; a real rules engine + DSP2 is out of case-study scope (CADRAGE "automate the deterministic" is *demonstrated by the seeded output shape*, not implemented).
- **Mutations are real.** annotate/override/validate/request-info/checklist/pre-assessment/hidden-account-disposition persist and append to an `AuditEvent` log (satisfies T3/T4). Two write patterns per design plan §In-flight: optimistic autosave for notes, explicit-confirm for verdicts.
- **Aggregate read endpoint.** `GET /dossiers/:id` returns the full dossier aggregate (completeness, score, analysis, audit) in one call — the Workspace loads once, sections render from cache; matches the "load on open, refresh on open" decision (PM non-goal: no live polling).
- **Shared API contract via types.** API DTO types are mirrored in a small `web/src/api/types.ts` (hand-kept; no codegen for v0). Define the contract before parallelizing FE/BE.
- **Design tokens are the first FE work.** `StatusBadge` + the status color tokens (DESIGN.md §5/§7) are the source of truth every screen depends on — built before any screen.
- **No auth.** A single hardcoded analyst identity (e.g. `L. Tostée`) for attribution. Multi-analyst/claimed state (Q7) deferred — see TODOS.md.
- **Owner agents:** `nerd` (NestJS/Prisma), `zuch` (React/.tsx), `mate` (Docker only if build wiring breaks), `oonolive` (tests), `houellebeck` (docs). Read the package `README.md` before touching a package (CLAUDE.md source-of-truth rule).

## Dependency Graph
```
Prisma schema ──▶ migration ──▶ seed ──▶ Prisma client/types
      │                                        │
      │                                        ▼
      │                              API DTOs / contract (types.ts)
      │                                        │
      │                         ┌──────────────┴───────────────┐
      │                         ▼                              ▼
      │                  API read endpoints            API mutation endpoints
      │                         │                              │
NestJS scaffold                 └──────────────┬───────────────┘
Web scaffold ──▶ web API client ───────────────┘
      │
      ▼
ui: status tokens + StatusBadge ──▶ shared components ──▶ Queue ──▶ Workspace shell
                                                              │
                                          ┌───────────────────┼───────────────────┐
                                          ▼                   ▼                   ▼
                                     Complétude slice    Analyse slice       Score slice
                                          └───────────────────┴───────────────────┘
                                                              ▼
                                                  polish: a11y · states · audit · toasts
```

---

## Task List

### Phase 1 — Foundations

#### Task 1: Scaffold the NestJS API package
**Description:** Create `packages/api` as a working NestJS app honoring the Docker build contract in `packages/api/README.md` (scripts `build`, `start:prod`, `start:dev`; serves on `:3000`; CORS for the web origin from `CORS_ORIGIN`).
**Acceptance criteria:**
- [ ] `packages/api/package.json` exists with `build` / `start:prod` / `start:dev` and is part of the pnpm workspace.
- [ ] `GET /health` returns 200; CORS enabled for `CORS_ORIGIN`.
- [ ] App reads config (`DATABASE_URL`, `CORS_ORIGIN`, `PORT`) from env.
**Verification:**
- [ ] `pnpm --filter @karmen/api build` succeeds.
- [ ] `docker compose up --build api db migrate` → api becomes healthy; `curl localhost:3000/health` → 200.
**Dependencies:** None
**Files:** `packages/api/package.json`, `src/main.ts`, `src/app.module.ts`, `src/health.controller.ts`, `tsconfig.json`
**Scope:** M · **Owner:** nerd

#### Task 2: Scaffold the Web package (Vite + React + Router + @karmen/ui)
**Description:** Create `packages/web` as a Vite React SPA honoring `packages/web/README.md` (scripts `build`→`dist/`, `dev`; SPA fallback; reads `VITE_API_BASE_URL`). Wire Tailwind v4 + `@karmen/ui` (`import "@karmen/ui/globals.css"`, `@source` the ui src), a router, and a shell layout placeholder.
**Acceptance criteria:**
- [ ] `packages/web/package.json` with `build`/`dev`; workspace dep `@karmen/ui: workspace:*`.
- [ ] App renders a placeholder route; imports a `Button` from `@karmen/ui` to prove the pipeline.
- [ ] Router configured with `/` (queue) and `/dossiers/:id` (workspace) placeholder routes.
**Verification:**
- [ ] `pnpm --filter @karmen/web build` emits `dist/`.
- [ ] `docker compose up --build web` → reachable on `WEB_PORT`, Button renders styled.
**Dependencies:** None (parallel with Task 1)
**Files:** `packages/web/package.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/globals.css`, `src/router.tsx`
**Scope:** M · **Owner:** zuch

### Checkpoint: Foundations
- [ ] `docker compose up --build` brings up db + migrate(placeholder) + api(health) + web(placeholder).
- [ ] Both packages build clean. Commit (`build(api)`, `build(web)`).

---

### Phase 2 — Data Model & Seed

#### Task 3: Prisma schema + first migration
**Description:** Define the schema for the seeded-fixtures model and generate the initial migration. Entities: `Analyst`, `Dossier`, `Completeness`, `ConnectionSource`, `HiddenAccount`, `Score`, `ScoreFactor`, `CheckItem`, `Indicator` (status enum: conforme/notable/blocking/info/not_computed), `Mitigant`, `PreAssessment`, `Annotation`, `Override`, `AuditEvent`. Wire the Prisma seed hook (replace placeholder `prisma/seed.ts` wiring per its header).
**Acceptance criteria:**
- [ ] `schema.prisma` models all entities with relations + enums for status/severity/confidence/gate state matching DESIGN.md §7.
- [ ] `prisma migrate deploy` applies cleanly against the compose db.
- [ ] Seed hook declared (prisma.config.ts or package.json key) so the `migrate` service runs it.
**Verification:**
- [ ] `docker compose run --rm migrate` applies migration + runs seed without error.
- [ ] `prisma studio` (or psql) shows the tables.
**Dependencies:** Task 1
**Files:** `packages/api/prisma/schema.prisma`, `prisma.config.ts`, `packages/api/package.json` (deps)
**Scope:** M · **Owner:** nerd

#### Task 4: Rich seed covering every design state
**Description:** Replace the placeholder seed with idempotent (upsert) data that exercises **every state the design plan specifies** — so the UI can be built and demoed against real variety.
**Acceptance criteria:**
- [ ] ≥6 dossiers covering: (a) clean/Propre+high-conf, (b) exception with 2 anomalies (1 blocking+mitigant, 1 notable+no mitigant), (c) incomplet–en attente client, (d) awaiting re-eval, (e) hard block (0 liasses / connection failed), (f) thin history (10mo → score+conf faible) and one below-floor (no score, Q8).
- [ ] One dossier seeds a hidden-account flag; one seeds a fallback (manual upload) source; pre-assessment text seeded for each.
- [ ] Seed is idempotent (safe re-run).
**Verification:**
- [ ] Re-running `prisma db seed` twice produces no duplicates/errors.
- [ ] Each queue priority tier (fast close / unblocked exception / awaiting re-eval / client-blocking / hard block) has ≥1 dossier.
**Dependencies:** Task 3
**Files:** `packages/api/prisma/seed.ts`, `packages/api/prisma/seed-data.ts`
**Scope:** M · **Owner:** nerd

### Checkpoint: Data
- [ ] Fresh `docker compose down -v && up --build` re-seeds cleanly; all design states present in DB. Commit (`feat(api): prisma schema + seed`).

---

### Phase 3 — Frame (API reads + Queue + Workspace shell)

#### Task 5: API read endpoints + contract types
**Description:** `GET /dossiers` (queue projection: company, SIREN, status, score+category, complexity, daysInQueue, group/tier) and `GET /dossiers/:id` (full aggregate: completeness, score+factors+checklist, analysis indicators+mitigants, pre-assessment, audit). Define the response DTOs as the shared contract.
**Acceptance criteria:**
- [ ] Both endpoints return seeded data with the exact shape the screens need (per design plan hierarchies).
- [ ] Queue response includes the 5-tier priority grouping/sort.
- [ ] DTOs documented; status/severity enums match DESIGN.md §7.
**Verification:**
- [ ] `curl localhost:3000/dossiers` and `/dossiers/:id` return correct JSON for ≥3 seeded dossiers (clean, exception, below-floor).
- [ ] `pnpm --filter @karmen/api test` (controller/service unit tests) passes.
**Dependencies:** Task 4
**Files:** `src/dossiers/dossiers.controller.ts`, `dossiers.service.ts`, `dto/*.ts`, `dossiers.module.ts`
**Scope:** M · **Owner:** nerd (tests: oonolive)

#### Task 6: Web API client + shared types
**Description:** Typed fetch client using `VITE_API_BASE_URL`; mirror the API DTOs in `web/src/api/types.ts`; a small query layer (or TanStack Query) for `getQueue()` / `getDossier(id)` with loading/error surfaces.
**Acceptance criteria:**
- [ ] `getQueue()` / `getDossier(id)` typed against the contract; CORS works against the running api.
- [ ] Loading + error states exposed to callers (feeds skeletons/error banners).
**Verification:**
- [ ] With the stack up, a temporary debug render lists seeded dossiers from the live API.
**Dependencies:** Task 2, Task 5
**Files:** `web/src/api/client.ts`, `web/src/api/types.ts`, `web/src/api/hooks.ts`
**Scope:** S · **Owner:** zuch

#### Task 7: Status tokens + `StatusBadge` (design-system foundation)
**Description:** Add the status color tokens to `@karmen/ui` `globals.css` (DESIGN.md §5) and build `StatusBadge` — the single source of truth rendering icon + label + color for every status/severity/confidence key (§7), with the color-is-never-alone guarantee. Add required shadcn primitives via CLI (`badge`, `tooltip`, `skeleton`, `separator`).
**Acceptance criteria:**
- [ ] Every status key in §7 renders correct icon+label+color; `aria-label` combines status + context.
- [ ] Tokens meet WCAG AA on the neutral base (closes TODOS.md item 1 / gap C) — verify contrast, set real oklch values.
**Verification:**
- [ ] A storybook-less demo page renders all status keys; manual contrast check ≥4.5:1; grayscale still legible.
**Dependencies:** Task 2
**Files:** `packages/ui/src/components/status-badge.tsx`, `packages/ui/src/styles/globals.css`, (CLI-added) `badge.tsx`, `tooltip.tsx`, `skeleton.tsx`, `separator.tsx`
**Scope:** M · **Owner:** zuch

#### Task 8: Queue screen
**Description:** Build the Queue (design plan Screen 1): 5-tier grouped, actionability-sorted list of `QueueRow`s with `StatusBadge`, mono score, complexity, days-in-queue (SLA tint), truncate+tooltip, whole-row open. Loading skeletons, the two empty states, the load-error banner. Virtualized scroll for large lists.
**Acceptance criteria:**
- [ ] Renders seeded dossiers grouped into the 5 tiers, sorted by actionability.
- [ ] Loading (skeleton rows), empty ("Tout est traité" + see-closed), filter-empty, and error states all implemented.
- [ ] Long names truncate w/ tooltip; `— / —` for no-score; row click → `/dossiers/:id`.
**Verification:**
- [ ] Manual: with seed, all tiers visible; clicking a row navigates; kill the API → error banner shows.
- [ ] `pnpm --filter @karmen/web build` clean.
**Dependencies:** Task 6, Task 7
**Files:** `web/src/screens/Queue.tsx`, `web/src/components/QueueRow.tsx`, `web/src/components/EmptyState.tsx`
**Scope:** M · **Owner:** zuch

#### Task 9: Workspace shell (routing + sidebar + header)
**Description:** Build the Workspace shell (design plan Screen 2): header (back-to-queue, company+SIREN, dossier verdict, prominent `Valider`), `sidebar` with `SectionNavItem`s (per-section StatusBadge), greyed Recommandation item, collapsible Audit foot. Section routing renders the active section into the main area. Add shadcn `sidebar`, `scroll-area`.
**Acceptance criteria:**
- [ ] Navigates between Complétude/Score/Analyse (placeholders ok until their slices); per-section status badges reflect aggregate data.
- [ ] Clean dossier → "Rien à signaler" + Valider emphasized; exception → "N anomalies"; section-not-computable → partial state + CTA swaps to "Demander des informations".
- [ ] Greyed Recommandation never a dead link; back-to-queue always present.
**Verification:**
- [ ] Manual: open a clean vs exception vs below-floor dossier → header + nav states differ correctly.
**Dependencies:** Task 6, Task 7
**Files:** `web/src/screens/Workspace.tsx`, `web/src/components/SectionNavItem.tsx`, `web/src/components/WorkspaceHeader.tsx`, `web/src/router.tsx`
**Scope:** M · **Owner:** zuch

### Checkpoint: Frame (end-to-end)
- [ ] Queue → open dossier → navigate sections works against the live seeded API.
- [ ] All tests pass, both packages build. Commit per slice (`feat(web): queue`, `feat(web): workspace shell`).
- [ ] **Review with human before building section slices.**

---

### Phase 4 — Slice: Complétude

#### Task 10: Complétude view + hidden-account disposition
**Description:** Build design plan Screen 3: `CompletenessGate` verdict banner, `ConnectionStatusRow` per source (state, depth/width metrics, EvidenceLink "Audit"), depth/width progress, last-reminder, and the hidden-account block with the **two resolved actions** (Q4: "Demander la connexion" + "Marquer hors périmètre" w/ required reason). Add the disposition mutation endpoint (`POST /dossiers/:id/hidden-accounts/:hid/disposition`) → persists + audit.
**Acceptance criteria:**
- [ ] Gate states (Complet / action requise / en attente client) render from data; per-source connected/pending/failed/fallback states all covered.
- [ ] Edge cases: 8-month history (warn tint + judgment link), 0 liasses (blocking), many accounts (count not N rows), fallback caption.
- [ ] Hidden-account disposition persists with reason → audit entry; UI reflects new disposition.
**Verification:**
- [ ] Manual across seeded dossiers (complet, failed-source, hidden-account, thin-history); disposition survives refresh.
- [ ] API mutation unit test passes.
**Dependencies:** Task 9
**Files:** `web/src/sections/Completude.tsx`, `web/src/components/CompletenessGate.tsx`, `ConnectionStatusRow.tsx`, `EvidenceLink.tsx`; `api/src/dossiers/hidden-accounts.controller.ts`
**Scope:** M · **Owner:** zuch (endpoint: nerd)

### Phase 5 — Slice: Analyse Financière (the biggest lever)

#### Task 11: Mutation endpoints (annotate / override / pre-assessment / validate / request-info / checklist)
**Description:** Build the persisting mutation endpoints feeding the Analyse + Score slices, each appending an `AuditEvent` (actor + timestamp). Enforce Q1 (override on any verdict, reason required, supersede-not-delete) and the stale-dossier guard on validate.
**Acceptance criteria:**
- [ ] `POST /annotations`, `POST /overrides`, `PATCH /pre-assessment`, `POST /validate`, `POST /request-info`, `POST /checklist/:id` all persist + write audit.
- [ ] Override stores original + new + reason; validate rejects if eval changed since load (412/conflict).
**Verification:**
- [ ] `pnpm --filter @karmen/api test` covers each mutation + the stale-validate conflict.
**Dependencies:** Task 5
**Files:** `api/src/dossiers/mutations.controller.ts`, `mutations.service.ts`, `audit.service.ts`, `dto/*.ts`
**Scope:** M · **Owner:** nerd (tests: oonolive)

#### Task 12: Analyse Mode A (exception view) — AnomalyCard, mitigants, annotations, overrides
**Description:** Build design plan Screen 5 Mode A: pre-assessment block (editable → PATCH, Q5, overwrite-on-stale warning), severity-ordered `AnomalyCard`s (value vs threshold mono, severity badge, left-border accent, EvidenceLink, `MitigantRow`(s) or "aucun mitigant", `AnnotationField`, `OverrideControl`), collapsed "N indicateurs conformes", footer Valider / Demander des informations. Implements the **two write patterns** (autosave notes; explicit-confirm verdicts) from design plan §In-flight. Add shadcn `dialog`, `textarea`, `collapsible`, `dropdown-menu`, `sonner`.
**Acceptance criteria:**
- [ ] Anomalies severity-ordered; each card fully functional; annotation autosaves with attribution; override opens reason dialog, persists, shows superseded verdict.
- [ ] In-flight: Valider shows pending+lock, success→header "Validé par… ·timestamp"+toast, failure→"aucune décision enregistrée". Blocking present → Valider disabled w/ reason, request-info promoted.
- [ ] Empty (0 anomalies) = dignified clean state; 20-anomaly scroll keeps footer reachable.
**Verification:**
- [ ] Manual: annotate (refresh persists), override (reason required, audited), validate clean dossier (toast + queue reflects), validate-blocking disabled.
**Dependencies:** Task 9, Task 11
**Files:** `web/src/sections/Analyse.tsx`, `components/AnomalyCard.tsx`, `MitigantRow.tsx`, `AnnotationField.tsx`, `OverrideControl.tsx`, `PreAssessment.tsx`
**Scope:** L → split if needed (cards vs pre-assessment/footer) · **Owner:** zuch

#### Task 13: Analyse Mode B (full indicator table)
**Description:** The on-demand full table: indicateur / valeur / seuil / statut (icon+color) / évidence, filter tous/anomalies/conformes, expandable from the collapsed conforming line, toggle back to Mode A. Doubles as the eval-failed fallback (CADRAGE repli). Add shadcn `table`.
**Acceptance criteria:**
- [ ] Renders all indicators incl. `not_computed` (never silently dropped, T7); filter works; toggle A↔B preserves context.
- [ ] Eval-failed state routes here with the explanatory message.
**Verification:**
- [ ] Manual: expand conforming → table; filter to anomalies matches Mode A cards; not_computed visible.
**Dependencies:** Task 12
**Files:** `web/src/sections/AnalyseTable.tsx`, (CLI-added) `table.tsx`
**Scope:** S · **Owner:** zuch

### Checkpoint: Core thesis demo
- [ ] Full exception flow works end-to-end against live API: triage → open → completude → analyse → annotate/override → validate/request-info, all persisting.
- [ ] **Review with human** — this is the case study's centrepiece.

---

### Phase 6 — Slice: Score

#### Task 14: Score view
**Description:** Build design plan Screen 4: `ScoreHeadline` (hero mono score + category word + `ConfidenceSignal` with inline reason, Q6 static), `ScoreFactorList` (3–5 factors: direction arrow, weight bar), `WhatToCheckList` of `CheckItem`s (checkable → checklist mutation, EvidenceLink), `CalibrationNote`. Implements the Q8 floor: below-floor → "Score indisponible — données insuffisantes" + what's missing + link to Complétude; thin → number + conf faible w/ reason.
**Acceptance criteria:**
- [ ] Clean→A/B+high-conf 30s read; thin→number+conf faible+reason; below-floor→no number, honest gap.
- [ ] Factors render (no padding to 5); checklist toggles persist; overridden score shows original struck + new + attribution.
**Verification:**
- [ ] Manual across clean / thin / below-floor seeded dossiers; checklist survives refresh.
**Dependencies:** Task 9, Task 11
**Files:** `web/src/sections/Score.tsx`, `components/ScoreHeadline.tsx`, `ScoreFactorList.tsx`, `ConfidenceSignal.tsx`, `WhatToCheckList.tsx`, `CalibrationNote.tsx`
**Scope:** M · **Owner:** zuch

---

### Phase 7 — Polish (states, a11y, audit)

#### Task 15: Audit trail panel
**Description:** The collapsible dossier-wide audit log (T4) at the sidebar foot: timestamped, attributed events from every mutation, newest first.
**Acceptance criteria:**
- [ ] Shows all event types (annotate/override/validate/request-info/disposition/checklist/pre-assessment edit) with actor + timestamp.
**Verification:** [ ] Perform each mutation → appears in audit after refresh.
**Dependencies:** Task 11, Task 12, Task 14
**Files:** `web/src/components/AuditTrail.tsx`
**Scope:** S · **Owner:** zuch

#### Task 16: Keyboard navigation & accessibility pass
**Description:** Implement design plan §Responsive & accessibility: queue roving tabindex (↑/↓/Enter//), within-dossier shortcuts (g+section/1–4, v, e, a), focus order, ARIA landmarks, `aria-current`, screen-reader score sentence + badge labels, focus ring contrast, `prefers-reduced-motion`.
**Acceptance criteria:**
- [ ] Full keyboard traversal queue→dossier→sections→actions; score announced as a sentence; landmarks present.
**Verification:** [ ] Manual keyboard-only run of both journeys; VoiceOver reads score + badges correctly; axe/Lighthouse a11y ≥95.
**Dependencies:** Task 8, Task 9, Task 12, Task 14
**Files:** touches screens/components for ARIA + a `useHotkeys` helper
**Scope:** M · **Owner:** zuch

#### Task 17: State & resilience consistency sweep
**Description:** Ensure loading/empty/error/partial/in-flight are consistent across all screens per the state matrix; session-expiry + stale-dossier handling; toasts standardized; verify the not-enough-data and eval-failed fallbacks.
**Acceptance criteria:**
- [ ] Every screen's 5 matrix states + in-flight patterns implemented and visually consistent.
**Verification:** [ ] Manual: kill API mid-action, expire session, force stale-validate → all handled gracefully.
**Dependencies:** Tasks 8–14
**Files:** cross-cutting (client error handling, shared state components)
**Scope:** M · **Owner:** zuch

#### Task 18: E2E smoke + docs update
**Description:** Playwright smoke for the happy + exception journeys; update package READMEs / root README status; document the seeded dossiers and how to demo each state.
**Acceptance criteria:**
- [ ] E2E covers: triage→open clean→validate; open exception→override→request-info.
- [ ] READMEs reflect shipped scope; a short "demo guide" maps seed dossiers → design states.
**Verification:** [ ] `pnpm test:e2e` green against the compose stack.
**Dependencies:** Tasks 8–17
**Files:** `web/e2e/*.spec.ts`, `README.md`, package READMEs
**Scope:** M · **Owner:** oonolive (docs: houellebeck)

### Checkpoint: Complete
- [ ] All acceptance criteria met; both journeys pass E2E; a11y ≥95; full `docker compose up --build` works from clean.
- [ ] Deferred items in TODOS.md reviewed (Q3/Q7, viewport band D, Q8 thresholds confirmed or assumed-and-stated).

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Task 12 (Analyse Mode A) is L-sized | Med | Split into 12a (AnomalyCard+mitigants+annotate/override) and 12b (pre-assessment edit + footer/validate) if it exceeds one session. |
| FE/BE contract drift (hand-kept types) | Med | Define DTOs in Task 5 first; treat `types.ts` as the contract; consider codegen later (post-v0). |
| Seed not covering a design state → unbuildable screen state | Med | Task 4 acceptance explicitly enumerates required states; verify before Phase 3. |
| Prisma v7 seed-hook wiring (not auto-run by migrate) | Low | seed.ts header already documents the explicit `migrate` call; confirm in Task 3. |
| Color tokens fail AA on neutral base | Low | Folded into Task 7 (gap C closed there, not deferred). |
| Scope creep toward a real eval engine | Med | Architecture decision is fixed: seeded fixtures. Eval engine is explicitly out (TODOS / future). |

## Open Questions (carried from design review — confirm at checkpoints)
- **Q7 multi-analyst/claimed state** — deferred; v0 assumes single analyst. Confirm before any queue-locking work. (TODOS #5)
- **Q3 unit of analysis** — dossier-flat assumed (timeline = v2). (TODOS #4)
- **Q8 exact thresholds** — design locked; the floor/thin-band *numbers* need a credit-policy value or an explicit stated assumption. (TODOS #3)
- **1024–1280px band (gap D)** — undefined; decide sidebar-collapse vs reflow during Task 9 or defer. (TODOS #2)

## Parallelization
- **After Task 5 (contract):** backend mutations (Task 11) ∥ frontend frame (Tasks 6–9) can proceed in parallel.
- **After the Frame checkpoint:** the three slices (Complétude / Analyse / Score) are largely independent and parallelizable across sessions/agents — they share only the Workspace shell + StatusBadge (already built).
- **Sequential:** Tasks 1–5 (schema→seed→contract) are a hard chain; do not parallelize.
