# CLAUDE.md

Guidance for AI agents working in this repo. Read this first, then the relevant spec, then the package's README before writing code.

## Stack
NestJS · React · TypeScript · Docker · monorepo

## Agents & Skills
- Prefer specialized agents and skills over doing everything inline.
- Delegate each task to the agent/skill best suited for it (e.g. code review, testing, planning, frontend work).
- Default to the right tool for the job rather than improvising.

## Commits
- Use atomic commits: one logical change per commit.
- Messages MUST follow Conventional Commits (`type(scope): subject`).
- Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`, `perf`, `style`.
- commitlint enforces this — non-conforming messages will be rejected.

## Specs
- The `specs/` directory holds specifications.
- Read the relevant spec there before implementing any feature or change.

## Monorepo: Source of Truth
- This is a monorepo with multiple packages.
- When dispatched to work on a package, the SOURCE OF TRUTH for that package is the `README.md` inside the package directory.
- If a package has no README and there is any doubt about its purpose or conventions, STOP and ask a clarifying question — do not assume.
