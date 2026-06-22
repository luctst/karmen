# @karmen/ui

The Karmen shared **component library** — [shadcn/ui](https://ui.shadcn.com) components (Tailwind v4) for the pnpm-workspaces monorepo. Other packages (e.g. `@karmen/web`) consume components from here instead of redefining them.

> **Source of truth for this package.** This README documents the contract and conventions. Follows the shadcn [monorepo guide](https://ui.shadcn.com/docs/monorepo), adapted to this repo's `packages/*` + pnpm layout (no Turborepo, `@karmen/*` scope).

## What this is

shadcn/ui is **not** an installed dependency — its CLI copies component source into `src/components/` so the code lives in-repo and is fully editable. This package owns that source plus the shared Tailwind theme. What ships in `package.json` is the peer stack: `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, and Tailwind v4.

## Layout

```
packages/ui/
├── components.json          # shadcn config (rsc:false — Vite SPA, not Next; Tailwind v4)
├── postcss.config.mjs       # Tailwind v4 PostCSS plugin (re-exportable)
├── src/
│   ├── components/          # shadcn components (button.tsx, card.tsx, …)
│   ├── hooks/               # shared hooks
│   ├── lib/utils.ts         # cn() — clsx + tailwind-merge
│   └── styles/globals.css   # Tailwind v4 theme (neutral base, CSS variables)
└── tsconfig.json            # @karmen/ui/* -> ./src/* path alias
```

## Consuming from another package

Add the workspace dependency (`"@karmen/ui": "workspace:*"`), then:

```ts
import "@karmen/ui/globals.css"            // once, at the app entry
import { Button } from "@karmen/ui/components/button"
import { Card, CardHeader, CardTitle } from "@karmen/ui/components/card"
import { cn } from "@karmen/ui/lib/utils"
```

The consuming app's Tailwind must scan this package's source so its classes aren't tree-shaken — in the app's `globals.css`:

```css
@source "../../ui/src/**/*.{ts,tsx}";
```

## Adding more components

The exports map (`./components/*`, `./lib/*`, `./hooks/*`) is glob-based, so new files are importable with no `package.json` change. Add components with the shadcn CLI from this directory:

```bash
cd packages/ui
pnpm dlx shadcn@latest add <component>   # e.g. dialog, input, dropdown-menu
```

The CLI reads `components.json`, drops the source into `src/components/`, rewrites imports to the `@karmen/ui/*` aliases, and installs any new Radix deps. Keep `style`, `baseColor`, and `iconLibrary` in `components.json` unchanged so components stay visually consistent.

## Scripts

| Script      | Purpose                          |
|-------------|----------------------------------|
| `typecheck` | `tsc --noEmit` over `src/`       |
