# AGENTS.md

How to route work to the right agent or skill in this repo. Pair this with
[CLAUDE.md](./CLAUDE.md) (conventions) — read both before starting.

> **Rule of thumb:** prefer a specialized agent or skill over doing the work
> inline. Pick the most specific match; if a package is involved, read its
> `README.md` first (see CLAUDE.md → Monorepo: Source of Truth).

## Agents

Project-scoped agents live in [`.claude/agents/`](./.claude/agents/).

| Agent | Use for | Reach for it when |
| --- | --- | --- |
| **nerd** | Back-end (NestJS / Node.js / TypeScript) | Building APIs, services, middleware, DB integration; reviewing or debugging backend code. |
| **zuch** | React components (`.tsx`) | Creating/refactoring components, decomposing large ones, extracting hooks. |
| **mate** | Docker & containers | Dockerfiles, `docker-compose`, multi-stage builds, networking/volumes, image size. |
| **oonolive** | Testing (JS/TS) | Writing unit/integration/e2e tests (Vitest, Jest, Playwright, etc.) after code changes. |
| **houellebeck** | Documentation | Writing/updating READMEs, API refs, guides, changelogs after features ship. |
| **thomas** | Design / UX | Critiquing a flow or UI decision before code is written; quick "does this feel right?" reviews. |
| **ponytail** | Anti-over-engineering | When a change risks bloat — enforces YAGNI and the simplest solution that works. Layers on other work. |

## Skills

Project-scoped skills live in [`.claude/skills/`](./.claude/skills/). Invoke
with `/<skill-name>`.

| Skill | Use for | Reach for it when |
| --- | --- | --- |
| **/spec-driven-development** | Writing specs before code | Starting a new feature/project with unclear or unwritten requirements. Output lands in `specs/`. |
| **/planning-and-task-breakdown** | Decomposing work | A spec exists and needs to become ordered, implementable tasks. |
| **/tdd** | Test-driven implementation | Implementing logic or fixing a bug — write the failing test first. |
| **/frontend-ui-engineering** | Production-quality UI | Building user-facing interfaces that must look and feel polished, not AI-generated. |
| **/code-review-and-quality** | Multi-axis code review | Before merging any change — review correctness, reuse, simplification, efficiency. |
| **/plan-design-review** | Design review of a plan | Rating UX/design dimensions of a plan before implementation. |
| **/qa-only** | Report-only QA | Testing the running app for bugs and producing a report — never fixes anything. |

## Typical flow

```
/spec-driven-development   → specs/ written
        ↓
/planning-and-task-breakdown → ordered tasks
        ↓
implement with the right agent (nerd · zuch · mate …) + /tdd
        ↓
/code-review-and-quality   → reviewed
        ↓
oonolive (tests) · /qa-only (smoke) · houellebeck (docs)
```

Commit atomically with Conventional Commits at each step (CLAUDE.md → Commits).
