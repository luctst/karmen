# Karmen — Design System

> The canonical design language for the Karmen analyst web app. Every screen, component, and state calibrates against this document. When a screen feels wrong, trace it back here.

Karmen is **not a consumer app**. It is a precision instrument for a credit analyst who is competent, time-starved, and rightly distrustful of black-box scores. The system does the deterministic work; the analyst spends judgment only where judgment is required. The entire interface exists to serve one feeling: **confident & focused — I touch only what needs me.**

---

## 1. Design principles

These are anchored to the trust requirements (T1–T7) and to review-by-exception. They are how we decide, not decoration.

### P1 — Nothing-to-do is a valid, dignified state
A clean dossier should feel *finished*, not empty. The default verdict of a healthy dossier is "validate and move on." We design the calm path with the same care as the alarming one. A green dossier gets a prominent, single `Valider` CTA and no busywork.
*Anchors: review-by-exception, P5 hierarchy.*

### P2 — Every output carries its reason, inline
No score, no anomaly, no status badge exists without a visible "because." The reason travels *with* the verdict — not behind a tooltip you have to hunt for. Confidence and calibration are first-class, not footnotes.
*Anchors: T1 explainability, T5 confidence, T6 calibration.*

### P3 — Evidence is one click from any claim
Any number, threshold, or flag the system asserts must be traceable to its source in a single action. The analyst can always answer "how do you know that?" without leaving the dossier.
*Anchors: T2 evidence access, T7 no hidden steps.*

### P4 — Judgment wins, and the record remembers
The analyst can annotate, override, or clear any system verdict — with a reason — and the system records who, what, when. The UI never makes the human feel like they are fighting the machine. Override is a designed-in affordance, not an escape hatch.
*Anchors: T3 override, T4 audit trail.*

### P5 — Hierarchy is service, density is respect
This is a dense professional tool. Whitespace is rationed; it is spent on separating *decisions*, not on breathing room. What the analyst needs first is visually loudest; everything else recedes until summoned. We collapse the conforming, surface the exceptional.
*Anchors: review-by-exception, T7 (collapsed-but-inspectable).*

### P6 — A brief, never a spreadsheet (by default)
The exception view leads with system-written prose and discrete, actionable items — a credit brief. The raw indicator table exists, but on demand. We present *conclusions with their workings attached*, not raw data for the analyst to re-derive.
*Anchors: core JTBD, P6 subtraction.*

---

## 2. Tone & personality

**Reference point: Linear's structural calm + Bloomberg terminal's data density + Stripe dashboard's trustworthy restraint.**

- **From Linear:** keyboard-first, fast, opinionated defaults, monochrome chrome with color reserved for meaning. The UI is quiet so the work is loud.
- **From a Bloomberg terminal:** information density is a feature. A professional reading 40 dossiers a day does not want a marketing-grade card with 32px padding around three numbers. Tight, scannable, numeric.
- **From Stripe dashboard:** financial data presented with sobriety and credibility. Color is semantic, never festive. Numbers are tabular and aligned. Nothing feels playful, because money decisions aren't.

**What Karmen is NOT:** not airy, not friendly-cartoonish, not gamified, no celebratory confetti, no illustration-heavy empty states. The personality is a **calm expert colleague** — terse, precise, never alarmist, never cute. When the system is confident it says so plainly; when it is unsure it admits it without drama.

**Voice in copy:** declarative, French (analyst-facing), short. "12 mois disponibles — conforme." not "Great news! You have all the data you need 🎉". Status reads like a colleague's note, not a notification.

---

## 3. Type scale

**Font families.** Work within the shadcn/Tailwind neutral defaults for UI text, add a mono for numerics.

- **UI / prose:** the platform sans stack (Tailwind `font-sans` → system UI / Geist-like). No webfont needed for v0; legible, fast, neutral.
- **Numeric / financial / mono:** `font-mono` (system mono stack: `ui-monospace, SFMono-Regular, Menlo, ...`). **All financial figures, ratios, scores, thresholds, IBANs, timestamps, and table numerics use mono with `tabular-nums`** so digits align in columns and values are comparable at a glance. This is non-negotiable — misaligned numbers erode trust in a credit tool.

| Role | Size (Tailwind) | Weight | Line-height | Notes |
|---|---|---|---|---|
| Page title (e.g. company name in workspace) | `text-xl` (20px) | `font-semibold` (600) | `leading-tight` | Truncates with tooltip on overflow |
| Section title (sidebar section, card heading) | `text-sm` (14px) | `font-semibold` (600) | `leading-snug` | Often paired with a status badge |
| Body / prose (pre-assessment, annotations) | `text-sm` (14px) | `font-normal` (400) | `leading-relaxed` (1.6) | The credit-brief reading text |
| Data / numeric (scores, ratios, values) | `text-sm`–`text-base` | `font-medium` (500), **mono, tabular-nums** | `leading-none`/`tight` | Right-aligned in tables |
| Hero score (score view headline) | `text-4xl` (36px) | `font-semibold`, **mono tabular-nums** | `leading-none` | The one big number on the score screen |
| Label / meta (field labels, "Banque DSP2") | `text-xs` (12px) | `font-medium` (500) | `leading-normal` | `text-muted-foreground`, often uppercase tracking-wide for column headers |
| Caption / timestamp (audit, "il y a 3j") | `text-xs` (12px) | `font-normal` (400) | `leading-normal` | `text-muted-foreground`, mono for timestamps |

**Rule:** never more than 3 type sizes visible in one dense region. Hierarchy comes from weight and color before size.

---

## 4. Spacing scale

Density target: **comfortable-dense.** Closer to Linear/Bloomberg than to a marketing site. Row height in the queue and indicator tables: **40–44px** (44 keeps a11y touch target; see §9).

Tailwind steps we actually use: **`1, 2, 3, 4, 6, 8`** (4/8/12/16/24/32px). Reserve `12` / `16` only for top-level page gutters.

- **Component inner padding:** `p-3` (12px) for dense cards/rows, `p-4` (16px) for primary cards (AnomalyCard, ScoreCard).
- **Between fields in a group:** `gap-2` (8px).
- **Between cards / decision blocks:** `gap-4` (16px). This is where we *do* spend whitespace — separating distinct decisions.
- **Page gutter:** `px-6` (24px) main content, `px-4` sidebar.
- **Section vertical rhythm:** `space-y-6` between major sections of a view.
- **Table cell padding:** `px-3 py-2`.

Whitespace is spent to separate *decisions*, not to pad data. If two numbers are meant to be compared, they go close together.

---

## 5. Color & semantics

Built on the existing shadcn **neutral oklch base** (see `packages/ui/src/styles/globals.css`). The chrome stays monochrome; **color is reserved exclusively for status and severity.** A screen with no problems is almost entirely neutral. Color appearing on screen *means something needs attention* — that is the signal economy.

### Status color tokens (to add as CSS variables in `globals.css`)

We add a semantic layer on top of the neutral base. Light-mode oklch values; dark-mode equivalents added alongside. Each maps to a Tailwind color utility via `@theme inline`.

| Token | Meaning | Light oklch (approx) | Tailwind ref |
|---|---|---|---|
| `--status-clean` | Propre / Conforme / Validé | green ~`oklch(0.62 0.17 150)` | emerald-600 family |
| `--status-clean-bg` | clean badge surface | `oklch(0.96 0.03 150)` | emerald-50 |
| `--status-warn` | Anomalie notable / pending / Modérée | amber ~`oklch(0.75 0.15 80)` | amber-500 family |
| `--status-warn-bg` | warn badge surface | `oklch(0.96 0.05 85)` | amber-50 |
| `--status-block` | Anomalie bloquante / connexion échouée / Faible | red (reuse `--destructive`) | destructive |
| `--status-block-bg` | block badge surface | `oklch(0.96 0.03 25)` | red-50 |
| `--status-neutral` | Incomplet / inconnu / informatif / non connecté | `--muted-foreground` | neutral-500 |
| `--status-info` | informational anomaly / system note | blue ~`oklch(0.60 0.13 240)` | blue-600 |

### Color-is-never-alone (a11y, T1)

Every status is encoded **three ways**, always:
1. **Color** (the fast channel)
2. **Icon / shape** (CheckCircle, AlertTriangle, MinusCircle, Clock — see §8)
3. **Text label** (Conforme / Anomalie / Incomplet — never just a colored dot)

A colorblind analyst, a grayscale print, or a screen reader must all get the full verdict. Badges therefore always render `icon + label`, color optional. Severity in tables is shown by a leading icon + a left border accent, not a colored cell fill alone.

Contrast: all status text on its `-bg` surface meets WCAG AA (≥4.5:1). The hero score color is decorative reinforcement only — the category word ("Risque modéré") carries the meaning.

---

## 6. Component vocabulary

### shadcn components to add via CLI (`cd packages/ui && pnpm dlx shadcn@latest add ...`)

| Component | Maps to UI need |
|---|---|
| `badge` | every status / severity / category chip |
| `table` | indicator table (Mode B), conforming-indicators expansion |
| `tabs` | (optional) Mode A / Mode B toggle in Analyse financière |
| `collapsible` / `accordion` | "23 indicateurs conformes" expand, conforming groups |
| `tooltip` | truncated names, threshold definitions, confidence reasons |
| `dialog` | override / clear-with-reason modal, "Demander des informations" composer |
| `textarea` + `input` + `label` | annotations, override reasons, editable pre-assessment |
| `dropdown-menu` | row actions, queue sort/filter |
| `separator` | structural division in dense views |
| `skeleton` | loading states (queue rows, score card) |
| `scroll-area` | long indicator tables, long dossier sidebars |
| `sonner` (toast) | "Dossier validé", "Relance envoyée" confirmations |
| `avatar` | analyst attribution in audit trail / claimed state |
| `sidebar` | dossier workspace shell (shadcn sidebar block; tokens already in globals.css) |

### Custom components (built on shadcn primitives, named, owned in `@karmen/ui` or `@karmen/web`)

| Component | Responsibility |
|---|---|
| `StatusBadge` | The single source of truth for status rendering: takes a `status` + `severity`, renders icon + label + color. Used everywhere. (See §7.) |
| `ScoreHeadline` | Hero score + category + confidence signal as one block (mono tabular score, category word, confidence pill with reason). |
| `ScoreFactorList` | The 3–5 determinant factors: name, direction arrow (↑/↓ contribution), weight bar. |
| `CheckItem` / `WhatToCheckList` | "Quoi vérifier" actionable checklist (2–4 items), each checkable, each linkable to evidence. |
| `ConfidenceSignal` | Élevée / Modérée / Faible pill **with its reason inline** (T5). Reusable in score + analysis. |
| `AnomalyCard` | The atom of the exception view: indicator, value vs threshold, breach magnitude, severity badge, paired mitigant(s), inline analyst annotation, evidence link. |
| `MitigantRow` | Rendered inside AnomalyCard, visually subordinate (indented, lighter), pairs to its anomaly. |
| `ConnectionStatusRow` | Per-source row in Complétude: source name, state (connected/pending/failed/fallback), depth/width metrics, last reminder timestamp. |
| `CompletenessGate` | The top-of-completude verdict banner: Complet / Incomplet—action requise / Incomplet—client en attente. |
| `QueueRow` | One dossier in the queue: company, status badge, score+category, complexity signal, days-in-queue, primary open action. |
| `EvidenceLink` | The consistent "1 click to source" affordance (T2) — icon + label, opens source pane. |
| `AnnotationField` | Inline annotation input with audit attribution (who/when) shown after save (T4). |
| `OverrideControl` | Override / clear-with-reason action that opens the reason dialog and writes to audit (T3, T4). |
| `EmptyState` | Warm, professional empty/zero state: one line of context + one primary action. Never "No items found." |
| `CalibrationNote` | "Sur 142 dossiers similaires, ce score a bien prédit dans 89% des cas" — the track-record line (T6). |
| `SectionNavItem` | Sidebar section row with its per-section status badge (Validé/Anomalie/Incomplet). |

---

## 7. Status & severity system — single source of truth

This table governs **every badge and state in the app.** `StatusBadge` is the only component that renders these; nothing hand-rolls a colored chip.

| Status key | Label (FR) | Color token | Icon (lucide) | Shape cue | Used in |
|---|---|---|---|---|---|
| `clean` | Propre / Conforme / Validé | `status-clean` | `CheckCircle2` | solid | Queue, sections, indicators |
| `anomaly_notable` | Anomalie (notable) | `status-warn` | `AlertTriangle` | triangle | Queue, AnomalyCard |
| `anomaly_blocking` | Anomalie bloquante | `status-block` | `OctagonAlert` | octagon | AnomalyCard, sections |
| `anomaly_info` | Informatif | `status-info` | `Info` | circle-i | AnomalyCard |
| `incomplete_action` | Incomplet — action requise | `status-warn` | `CircleAlert` | filled-alert | Queue, Complétude gate |
| `incomplete_waiting` | Incomplet — en attente client | `status-neutral` | `Clock` | clock | Queue, Complétude gate |
| `pending` | En attente / en cours | `status-neutral` | `Loader`/`Clock` | clock | Connection rows |
| `decided` | Décidé / Refusé (terminal) | `status-neutral` | `CircleSlash` | slash | Queue (closed dossiers) |
| `failed` | Échec connexion | `status-block` | `PlugZap`/`XCircle` | x | ConnectionStatusRow |
| `fallback` | Repli (upload manuel) | `status-warn` | `FileUp` | up-arrow | ConnectionStatusRow |
| `conf_high` | Confiance élevée | `status-clean` | `ShieldCheck` | shield | ConfidenceSignal |
| `conf_med` | Confiance modérée | `status-warn` | `ShieldAlert` | shield-! | ConfidenceSignal |
| `conf_low` | Confiance faible | `status-block` | `ShieldX` | shield-x | ConfidenceSignal |

**Score categories** (A–E) are a separate dimension and rendered as the category word + risk phrase ("B — Risque modéré"), color-tinted to match the nearest status family (A/B→clean tint, C→warn, D/E→block), but the **word always carries the meaning** (P2, a11y).

**Severity ordering** in the exception view, top to bottom: `blocking` → `notable` → `informational`. Conforming indicators collapse below all of them.

---

## 8. Iconography & density rules

- **Library:** lucide-react (already a peer dep). One icon family, no mixing.
- **Sizes:** `16px` inline with text (badges, rows), `20px` for section nav, `14px` for dense meta. Never larger than the text it labels except the score-view confidence shield.
- **Icons are meaning-bearing, not decorative.** If an icon doesn't encode status, an action, or a source type, it doesn't ship. No icons next to body prose.
- **Status icons are mandatory** wherever a status color appears (the color-is-never-alone rule).
- **Density rules:**
  - Queue & indicator rows: 40–44px height, single line, truncate-with-tooltip on overflow.
  - Max one badge per row in the queue (the dominant status); secondary signals are text/meta.
  - Borders over shadows for separating dense content (shadows reserved for elevated surfaces: dialogs, dropdowns).
  - `radius` stays at the existing `0.625rem` for cards; rows/badges use `radius-sm`.
  - No empty decorative space inside data regions; whitespace lives *between* decision blocks (§4).
