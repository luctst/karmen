# Karmen — Design Plan (Screens, States, Journeys)

> Screen-by-screen design plan for v0–v1 scope (Étapes 1→3: Complétude, Scoring, Données financières). Calibrates against `/DESIGN.md`. Desktop tool. Every decision anchors to a principle (P1–P6) or trust requirement (T1–T7). Genuine choices are marked in **Open design decisions**.

**Scope in:** Dossier Queue, Dossier Workspace shell, Complétude, Score, Analyse Financière (Mode A + B).
**Scope out:** Étape 4 (Recommandation — greyed in nav), v2.5 AI draft, client onboarding UI, mobile.

---

## Screen 1 — Dossier Queue

### Purpose & the one thing
A triage surface, not an inbox. Sorted by **actionability**, not chronology (review-by-exception). The analyst's first glance answers: *"What can I close fastest, and what needs me?"*

**Hierarchy:** 1st — the dossier's **status badge + actionability rank** (can I close this in 10s, or does it need judgment?). 2nd — **company + score/category**. 3rd — complexity signal + days-in-queue (context, not driver).

### ASCII wireframe (desktop)
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Karmen          File d'attente                       [Recherche]  ◑ analyste│
├──────────────────────────────────────────────────────────────────────────┤
│ 24 dossiers · triés par priorité d'action      [Filtre ▾] [Statut ▾]       │
├──────────────────────────────────────────────────────────────────────────┤
│ ── Clôtures rapides (8) ───────────────────────────────────────────────── │
│ ✓ Propre   Boulangerie Martin SARL    72 / B Risque modéré  ·simple· 1j  →│
│ ✓ Propre   TechFlow SAS               81 / A Risque faible  ·simple· 0j  →│
│ ── Exceptions débloquées (5) ──────────────────────────────────────────── │
│ ⚠ Anomalie·2  Garage Dupont EURL      58 / C Risque modéré ·complexe·3j  →│
│ ── En attente de ré-éval (3) ──────────────────────────────────────────── │
│ ◷ En attente  Construction Léon SA    — / —               ·—·      6j   →│
│ ── Bloqués client (6) ──────────────────────────────────────────────────  │
│ ◷ Incomplet·client  Restaurant Le Phare   — / —           ·—·     12j   →│
│ ── Blocages durs (2) ─────────────────────────────────────────────────── │
│ ⛔ Incomplet·action  Holding Vega SAS  — / —              ·—·      9j   →│
└──────────────────────────────────────────────────────────────────────────┘
```

### Component breakdown
- `QueueRow` (custom) per dossier — `StatusBadge` (dominant status), company name (truncate+tooltip), score+category (mono tabular), complexity signal (text meta: simple/modéré/complexe), days-in-queue (mono), open affordance (whole row clickable + `→`).
- Group headers = the 5-tier priority ladder (fast closes → unblocked exceptions → awaiting re-eval → client blocking → hard blocks). Section count in header.
- Top bar: app nav, search (`input`), filter/status `dropdown-menu`, analyst identity.
- `skeleton` rows for loading; `EmptyState` for zero.

### Interaction states
- **Loading:** 6–8 `skeleton` rows under a single skeleton group header. No spinner-on-blank; preserve layout.
- **Empty (no dossiers):** `EmptyState` — "Aucun dossier en attente. Tout est traité." + secondary action "Voir les dossiers clôturés". Warm, not a void (P1: nothing-to-do is dignified).
- **Empty (filter returns zero):** "Aucun dossier ne correspond à ce filtre." + "Réinitialiser les filtres" primary.
- **Error (queue load failed):** inline banner "Impossible de charger la file. Réessayer" + retry button; keep top bar usable.
- **Success / partial:** normal grouped list. If a group is empty it collapses to a thin "0" header (or hides — see Open Q).

### Edge cases
- **Long company name** ("Société Coopérative Agricole des Producteurs de la Vallée du Rhône") → truncate at row width, full name on hover tooltip; never wrap a queue row.
- **No score yet** (incomplet/pending) → score column shows `— / —` in muted mono, not "0".
- **High days-in-queue** (12j+) → days value tints `status-warn` as an SLA nudge (still text, color reinforces).
- **Multi-analyst / claimed** → if claimed by someone else, row shows a small avatar + "claimed" lock; open is read-only (depends on Open Q7).
- **Huge queue (200+)** → virtualized scroll inside `scroll-area`; group headers sticky.

---

## Screen 2 — Dossier Workspace (shell)

### Purpose & the one thing
The container for analysis. The shell's job is to make the **overall dossier verdict and the single next action** obvious before the analyst dives into any section.

**Hierarchy:** 1st — **the header verdict + primary CTA** (for a clean dossier: a prominent `Valider`; for an exception: "X anomalies à examiner"). 2nd — **section nav with per-section status** (where is the problem?). 3rd — active section content.

### ASCII wireframe (desktop)
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← File   Garage Dupont EURL · SIREN 812 345 678        2 anomalies   [Valider]│
├──────────────┬───────────────────────────────────────────────────────────┤
│ COMPLÉTUDE   │                                                              │
│  ✓ Validé    │                                                              │
│ SCORE        │            [ active section renders here ]                   │
│  ✓ Validé    │                                                              │
│ ANALYSE FIN. │                                                              │
│  ⚠ Anomalie·2│                                                              │
│ ─────────────│                                                              │
│ RECOMMAND.   │                                                              │
│  (à venir)   │                                                              │
│              │                                                              │
│ Audit ▾      │                                                              │
└──────────────┴───────────────────────────────────────────────────────────┘
```

### Component breakdown
- `sidebar` (shadcn block; sidebar tokens already in globals.css) holding `SectionNavItem`s, each with section title + `StatusBadge`.
- Greyed `RECOMMAND.` nav item — visible (shows the future), disabled, "à venir" caption. Never a dead link.
- Header: back-to-queue, company name + SIREN (mono), dossier-level verdict summary, **one prominent `Valider` CTA** (primary button). Validate is the workspace's center of gravity (P1, review-by-exception).
- `Audit ▾` collapsible at sidebar foot → timestamped+attributed event log (T4).

### Interaction states
- **Loading:** shell + sidebar render immediately with skeleton badges; main area skeleton.
- **Empty:** n/a (a dossier always has at least Complétude). If sections can't compute yet → see partial.
- **Error (dossier load failed):** full-area error with retry; back-to-queue always available.
- **Success (clean):** all sections `✓ Validé`, header shows "Rien à signaler" + `Valider` is the only emphasized control. The calm path (P1).
- **Partial:** Complétude validé but Score not computable (insufficient data) → Score nav shows neutral "Données insuffisantes", Analyse greyed until upstream resolves. Header CTA changes to "Demander des informations".
- **Validated (post-action):** header collapses to "Validé par [analyst] · [timestamp]" (T4), `Valider` → disabled/"Validé" state, toast confirmation.

### Edge cases
- **Long company name in header** → truncate, SIREN stays visible (it's the unambiguous identifier).
- **All-blocking dossier** → `Valider` is disabled with reason on hover ("2 anomalies bloquantes à traiter"), CTA becomes "Demander des informations".
- **Override in progress** → header reflects "verdict modifié par l'analyste" badge (T3).
- **Dossier claimed by another analyst** → read-only banner across header (Open Q7).

---

## Screen 3 — Complétude view

### Purpose & the one thing
The foundational gate (CADRAGE: "tant que les pièces manquent, le dossier n'est pas analysable"). The one thing: **is this dossier analyzable, yes/no, and if no, whose action unblocks it** — mine or the client's. It shows *connection status and depth/width*, never raw documents.

**Hierarchy:** 1st — **the gate verdict** (`CompletenessGate`: Complet / Incomplet—action requise / Incomplet—client en attente). 2nd — **per-source connection rows** with the failing/pending one surfaced. 3rd — depth/width metrics + hidden-account detection + last reminder.

### ASCII wireframe (desktop)
```
┌── Complétude ──────────────────────────────────────────────────────────────┐
│ ✓  COMPLET — dossier analysable                                             │
├────────────────────────────────────────────────────────────────────────────┤
│ Sources connectées                                                          │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Banque (DSP2)        Connecté   3/3 comptes · 12 mois/compte  [Audit] │ │
│ │ ✓ Données fiscales     Connecté   2 liasses · 2023, 2024        [Audit] │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ⚠ Détection compte caché                                                    │
│   Virements récurrents → IBAN FR76•••4821 (même titulaire, non connecté)    │
│   → [Demander la connexion]   [Marquer comme hors périmètre ⌄]              │
│                                                                              │
│ Profondeur  ████████████ 12/12 mois     Largeur  3/3 comptes déclarés       │
│ Dernière relance : —                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component breakdown
- `CompletenessGate` (custom) — the verdict banner, full-width, colored by status, icon+label.
- `ConnectionStatusRow` per source — source name, state badge, depth/width metrics (mono), `EvidenceLink` ("Audit" → consult pieces, T2/T3; never raw doc dump).
- Hidden-account block — `AnomalyCard`-styled, with the two designed actions (Open Q4): "Demander la connexion" (primary) + "Marquer comme hors périmètre" with required reason (writes to audit, T4).
- Depth/width as compact progress + count; "Dernière relance" timestamp (mono).

### Interaction states
- **Loading:** gate skeleton + 2 connection-row skeletons.
- **Empty / first-touch:** before any connection — gate = "En attente des connexions client" + per-source rows in `pending`; primary "Envoyer la demande de connexion". Warm: "Le client n'a pas encore connecté ses données. Une relance automatique part dans 48h."
- **Error (connection failed mid-dossier):** affected `ConnectionStatusRow` → `failed` state, gate degrades to "Incomplet — action requise", inline "Réessayer la connexion" + "Basculer en repli (upload manuel)" (Open Q2). Other sources stay green.
- **Success:** gate = Complet, both sources connected, no hidden account → calm, single line, `Valider`-ready upstream.
- **Partial:** bank connected, fiscal pending → gate = "Incomplet — en attente client", show what's missing concretely.

### Edge cases
- **8-month history (< 12 req)** → depth bar `8/12` tinted warn, line "Historique court (8 mois). Acceptable selon politique ? → voir Score" (links the limit to judgment, not a hard fail; ties to Open Q8).
- **Hidden account detected** → see block above (T7: surfaced, not hidden).
- **Fallback / manual upload** → `fallback` badge, "Pièces téléversées manuellement — vérifier l'authenticité" caption (lower trust than connected, said plainly).
- **Many accounts (8 declared)** → connection rows stay one-per-source; account count in metric, not 8 rows.
- **Zero liasses** → blocking, gate red, "0/2 liasses — non analysable".

---

## Screen 4 — Score view

### Purpose & the one thing
Turn a black-box number into a **map of where to look**. The one thing: the **score + category + confidence**, read in one glance, with the factors that drove it immediately below. Clean fast-path target: factors read in 30s.

**Hierarchy:** 1st — **`ScoreHeadline`** (67 / B — Risque modéré + confidence signal). 2nd — **3–5 determinant factors** (the "why"). 3rd — "Quoi vérifier" checklist + calibration note.

### ASCII wireframe (desktop)
```
┌── Score ───────────────────────────────────────────────────────────────────┐
│                                                                              │
│   67  / B — Risque modéré          🛡 Confiance modérée                      │
│   ──────                            « Historique de 10 mois, < 12 requis »   │
│                                                                              │
│ Facteurs déterminants                                                        │
│   ↓ Trésorerie en baisse            poids ███████░░  fort                    │
│   ↑ Rentabilité stable              poids █████░░░░  moyen                    │
│   ↓ Endettement élevé               poids ██████░░░  fort                    │
│   ↑ Ancienneté 8 ans                poids ███░░░░░░  faible                  │
│                                                                              │
│ Quoi vérifier                                                                │
│   ☐ Confirmer l'origine de la baisse de trésorerie  → évidence              │
│   ☐ Vérifier le ratio d'endettement post-emprunt    → évidence              │
│                                                                              │
│ ⓘ Sur 142 dossiers similaires, ce score a bien prédit dans 89% des cas.     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component breakdown
- `ScoreHeadline` (custom) — hero mono number (`text-4xl tabular-nums`), category word + risk phrase, `ConfidenceSignal` pill **with reason inline** (T5).
- `ScoreFactorList` (custom) — 3–5 rows: direction arrow (↑/↓), factor name, weight bar (chart token), weight word.
- `WhatToCheckList` of `CheckItem`s (2–4) — each checkable, each with `EvidenceLink` (T2). Checking writes to audit.
- `CalibrationNote` (custom) — the track-record line (T6).

### Interaction states
- **Loading:** ScoreHeadline skeleton (big number placeholder) + 3 factor skeletons.
- **Empty / not-enough-data:** **no fake score.** Show "Score indisponible — données insuffisantes" + what's missing + link back to Complétude (Open Q8). Confidence honesty over a misleading number (T5, P2).
- **Error (score engine failed):** "Le moteur de score n'a pas pu s'exécuter. Réessayer." Never show a stale/guessed number.
- **Success (high conf, clean):** A/B category, `conf_high` shield, short checklist or none → the 30s fast read.
- **Partial (low confidence):** number shown but `conf_low` shield + prominent reason + longer "Quoi vérifier"; the UI signals "trust this less" (T5).

### Edge cases
- **Confidence Faible** → shield-x, reason mandatory, checklist expands; score number visually de-emphasized (still mono, muted tint).
- **All factors same direction** → fine; arrows just all match. Weight bars still differentiate.
- **Borderline category (e.g. 70 = A/B boundary)** → show the word, optionally "proche du seuil A" caption (no false precision).
- **Score overridden by analyst** → original struck, new value + reason + attribution shown (T3/T4).
- **Only 3 factors available** → render 3; never pad to 5 with noise (P6).

---

## Screen 5 — Analyse Financière / Vue Exception

### Purpose & the one thing
The biggest lever (−40min). Deliver a **credit brief, not a spreadsheet** (P6). The one thing: the **system-written pre-assessment** (the seed of the credit note) + the **anomalies that need judgment** — everything conforming is collapsed. Clean fast-path: read 3-line pre-assessment, `Valider`.

**Hierarchy:** 1st — **pre-assessment prose** (1–3 paragraphs). 2nd — **anomalies** (severity-ordered) each with its mitigant + annotation. 3rd — the collapsed "23 indicateurs conformes" line + Mode B toggle.

### ASCII wireframe — Mode A (default)
```
┌── Analyse financière ──────────────────────────────────  [Tableau complet ⌄]┐
│ Pré-évaluation                                                  ✎ Éditer     │
│ « L'entreprise présente une rentabilité stable mais une trésorerie en        │
│   tension sur les 3 derniers mois. L'endettement dépasse le seuil de         │
│   politique, partiellement compensé par un carnet de commandes solide. »     │
├──────────────────────────────────────────────────────────────────────────────┤
│ Anomalies (2)                                                                 │
│ ┌─ ⛔ BLOQUANTE ─────────────────────────────────────────────────────────┐  │
│ │ Ratio d'endettement   2.8   seuil ≤ 2.0   dépassement +40%   → évidence │  │
│ │   ↳ Mitigant : carnet de commandes 14 mois (couvre la dette court terme)│  │
│ │   ✎ [Annoter…]                                          [Override ⌄]    │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│ ┌─ ⚠ NOTABLE ───────────────────────────────────────────────────────────┐  │
│ │ Trésorerie / CA       4%    seuil ≥ 8%    écart -4pts        → évidence │  │
│ │   ↳ Aucun mitigant identifié                                            │  │
│ │   ✎ [Annoter…]                                          [Override ⌄]    │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│ ▸ 23 indicateurs conformes                                       (déplier)    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                       [Demander des informations]  [Valider]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### ASCII wireframe — Mode B (full table, on demand)
```
┌── Analyse financière · Tableau complet ──────────────────  [← Vue exception]┐
│ Indicateur            Valeur   Seuil    Statut        Évidence               │
│ Ratio d'endettement   2.8      ≤ 2.0    ⛔ Dépassé    → liasse 2024 p.4      │
│ Trésorerie / CA       4%       ≥ 8%     ⚠ Sous seuil  → relevés Q1          │
│ Marge brute           32%      ≥ 25%    ✓ Conforme    → liasse 2024 p.2      │
│ … (filtrable : tous / anomalies / conformes)                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component breakdown
- Pre-assessment block — system prose, `text-sm leading-relaxed`, with `✎ Éditer` → becomes editable `textarea` (Open Q5: it is the credit-note draft). Edits attributed (T4).
- `AnomalyCard` per anomaly — indicator, value vs threshold (mono tabular), breach magnitude, `StatusBadge` severity, left-border accent by severity, `EvidenceLink` (T2), `MitigantRow`(s) subordinate, `AnnotationField` (T4), `OverrideControl` (T3).
- Severity-ordered: blocking → notable → informational.
- `collapsible` "N indicateurs conformes" → expands into the conforming subset of the Mode B `table` (T7: nothing hidden, just folded).
- Mode B `tabs`/toggle → full `table`: indicateur / valeur / seuil / statut (color+icon) / évidence link; filter tous/anomalies/conformes.
- Footer actions: `Valider` (primary), "Demander des informations" (for blocking states → status En attente client).

### Interaction states
- **Loading:** pre-assessment skeleton (3 lines) + 2 anomaly-card skeletons.
- **Empty (zero anomalies = clean):** **this is the happy path, designed for dignity (P1).** Pre-assessment 3 lines + "Aucune anomalie. 26 indicateurs conformes." + prominent `Valider`. No empty-list sadness; it reads as "done."
- **Error (eval engine failed):** "L'évaluation automatique a échoué. Ouvrir le tableau complet pour analyser manuellement." → routes to Mode B as the resilient fallback (CADRAGE repli).
- **Success (post-validate):** cards collapse, "Validé" state, audit entry, toast.
- **Partial:** some indicators uncomputable → pre-assessment notes the gap, those indicators flagged "non calculé — donnée manquante" in Mode B, never silently dropped (T7).

### Edge cases
- **20 anomalies** → still severity-grouped + collapsible per severity tier; sticky footer keeps `Valider` reachable; `scroll-area`. We never make the analyst scroll past 20 cards to find the action.
- **Anomaly with no mitigant** → explicit "Aucun mitigant identifié" (absence is information, not a blank).
- **Anomaly with multiple mitigants** → stacked `MitigantRow`s under the card.
- **All-conforming (0 anomalies)** → see empty state above.
- **Blocking present** → `Valider` disabled w/ reason; "Demander des informations" promoted to primary.
- **Editing pre-assessment then upstream data changes** → warn "L'évaluation a changé depuis votre édition" before overwrite (protect analyst's draft, T3/T4).

---

## Information architecture

```
APP
├─ File d'attente (Queue)            ← home / triage
│   └─ [open dossier] →
└─ Dossier Workspace (shell)
    ├─ Header: company · verdict · [Valider] · ← retour file
    ├─ Sidebar nav (per-section status badges):
    │   ├─ Complétude        (gate · foundational)
    │   ├─ Score             (factors · map)
    │   ├─ Analyse financière (exception view / Mode A↔B)
    │   └─ Recommandation    (greyed — à venir, out of scope)
    └─ Audit trail (collapsible, dossier-wide · T4)

Within-dossier flow (logical order = data dependency):
   Complétude ──gate──▶ Score ──context──▶ Analyse financière ──▶ Valider
   (if gate fails → Demander des informations → En attente client)
```

---

## User journey storyboard

### Happy path — clean dossier (~5 min)
| STEP | USER DOES | USER FEELS | DESIGN SUPPORTS |
|---|---|---|---|
| Triage (5s) | Scans "Clôtures rapides" group | "These are easy money" | Actionability sort; Propre+high-conf at top (P5) |
| Open | Clicks Boulangerie Martin | "Let's see" | Whole-row click, instant shell render |
| Complétude (10s) | Sees gate = Complet, both green | "Foundations solid, no chasing" | `CompletenessGate` verdict-first (P1, T7) |
| Score (30s) | Reads 81/A, conf élevée, 4 factors | "Makes sense, I see why" | `ScoreHeadline` + factors inline (P2, T1) |
| Analyse (1min) | Reads 3-line pre-assessment, 0 anomalies | "Nothing needs me" | Dignified empty/clean state (P1, P6) |
| Valider | Clicks header `Valider` | "Done, on to the next" | One prominent CTA, toast, audit entry (T4) |
| 5-year | Returns daily | "I trust this; it never wastes my time" | Consistent calm path builds trust (P1, T6) |

### Exception path — anomalies (~25–35 min)
| STEP | USER DOES | USER FEELS | DESIGN SUPPORTS |
|---|---|---|---|
| Triage (5s) | Sees ⚠ Anomalie·2 in "Exceptions débloquées" | "This one needs me" | Severity badge + count in queue (P5, §7) |
| Open | Opens Garage Dupont | "What's wrong here" | Header shows "2 anomalies" |
| Complétude | Sees hidden-account flag | "Good catch, I'd have missed that" | Hidden-account detection surfaced (T7, Q4) |
| Score | C / Risque modéré, conf modérée + checklist | "I know where to look now" | `WhatToCheckList` + confidence reason (T1, T5) |
| Analyse (10min) | Reads pre-assessment, 2 anomaly cards + 1 mitigant | "A brief, not a spreadsheet" | `AnomalyCard` with paired mitigants (P6) |
| Evidence drilldown | Clicks → évidence on endettement | "I can verify the claim myself" | `EvidenceLink`, 1 click to source (T2, P3) |
| Annotate / override | Adds note, overrides one verdict w/ reason | "My judgment counts, it's recorded" | `AnnotationField` + `OverrideControl` (T3, T4) |
| Request info | Clicks "Demander des informations" | "Ball's in client's court, I'm unblocked" | Status → En attente client, returns to queue |
| 5-year | Sees calibration improve | "The system learns from my decisions" | `CalibrationNote` track record (T6) |

---

### First-time path — trust not yet earned (Day 1, the make-or-break arc)
The veteran storyboards above assume earned trust. On Day 1 the analyst's default is **skepticism** — they will re-derive the system's work by hand until it proves itself. The design's job is not to hide the machinery but to *invite verification* and let trust accrue. If we design only the trusting state, adoption dies at first contact.

| STEP | USER DOES | USER FEELS | DESIGN SUPPORTS |
|---|---|---|---|
| First open | Opens a dossier they'd normally analyze manually | "I don't trust this yet — prove it" | Nothing demands blind trust; every claim is inspectable (P2, T7) |
| Distrusts the score | Reads 67/B but doesn't believe it | "Where do these factors come from?" | `ScoreFactorList` + `EvidenceLink` per factor — the "why" is never hidden (T1, P2) |
| Re-derives by hand | Opens `Tableau complet` (Mode B), checks raw indicators against source | "Let me verify this myself" | Mode B + per-indicator évidence is a *first-class path*, not buried — they CAN re-derive (P3, T2) |
| Catches agreement | System's numbers match their manual check | "Huh — it's actually right" | Tabular mono values align exactly with source evidence (trust via traceability) |
| First override | Disagrees on one mitigant, overrides with reason | "OK, but I'm still in control" | `OverrideControl` — judgment wins, never trapped (P4, T3) |
| Sees the track record | Notices calibration note | "It's been right 89% on cases like this" | `CalibrationNote` — longitudinal proof, not a one-off (T6) |
| Session 2–10 | Re-derives less each time, trusts the clean path sooner | "I can let the green ones go faster now" | Consistency: same verdict structure every dossier; the calm path rewards trust (P1) |
| Trust earned | Stops opening Mode B on clean dossiers | "It saves me time without me checking" | The 5-min happy path above becomes their default — *this is where 2h→30min is realized* |

**Design implication:** the verification path (Mode B, evidence drill-down, factor sources) must be **equally polished and equally reachable** as the fast path — it is the on-ramp to trust, not a fallback for failures. Never gate it behind an error state. *(Anchors: T1, T2, T6, P3.)*

---

## Interaction state matrix

| Screen | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Queue | Skeleton rows + group header | "Tout est traité" + see closed | "Impossible de charger · Réessayer" | Grouped actionable list | Some groups empty/collapsed |
| Workspace shell | Shell + skeleton badges | n/a (always ≥1 section) | Full-area error + retry, back always | Clean: all Validé, `Valider` only | Score N/A → CTA = Demander infos |
| Complétude | Gate + row skeletons | "En attente connexions" + envoyer | Source `failed` + retry/repli | Complet gate, calm | One source pending = en attente client |
| Score | Big-number skeleton + factors | "Score indisponible — données insuff." | "Moteur indisponible · Réessayer" | Score+factors, fast read | Number + conf faible + reason |
| Analyse Fin. | Pre-assess + card skeletons | 0 anomalies = dignified "rien" + Valider | "Éval. échouée → tableau complet" | Cards + pre-assessment | Some indicators "non calculé" |

---

## In-flight, persistence & confirmation states

The state matrix above covers *rendering server truth*. This section covers what the analyst sees **during a mutation** — every audited action (annotate, override, clear, edit pre-assessment, Valider, request info). In a credit tool every write has legal weight, so **no write is ever silent or ambiguous.** Two distinct patterns, by reversibility:

### Pattern 1 — Low-stakes, reversible writes: optimistic + autosave
*(annotations, "Quoi vérifier" checkboxes, pre-assessment edits)*
- **Trigger:** save on blur / debounce while typing — no explicit Save button.
- **In-flight:** field shows a subtle `Enregistrement…` micro-label (muted, mono), content stays editable.
- **Success:** `✓ Enregistré · à l'instant` then settles to `Enregistré · [HH:MM] par [analyst]` (T4 attribution, never just "saved").
- **Failure:** field border → `status-warn`, inline `Échec de l'enregistrement · Réessayer`; the analyst's text is **never lost** (kept in the field), retry is one click.
- **Why:** these are notes, not verdicts — speed > ceremony; rollback is cheap (P5).

### Pattern 2 — High-stakes, state-transition writes: explicit confirm, never optimistic
*(Override a verdict, Clear an anomaly, Valider the dossier, Demander des informations)*
- **Trigger:** deliberate click → reason dialog where required (override/clear, T3).
- **In-flight:** the action button enters a `pending` state — label → `Validation…` + inline spinner, button disabled, **the rest of the verdict UI locks** (no double-submit on a credit decision).
- **Success:** optimistic UI is *not* used — wait for confirmation, then transition: header → `Validé par [analyst] · [timestamp]`, `sonner` toast `Dossier validé`, audit entry written (T4). Status propagates to queue on return.
- **Failure:** button returns to actionable, `status-block` inline banner `La validation a échoué — aucune décision enregistrée. Réessayer.` — the explicit "nothing was recorded" reassurance matters most here (T4/T5).
- **Why:** a credit decision must reflect committed server state, not a hopeful client guess. The analyst must never believe a dossier is decided when it isn't.

### Session & connectivity edges
- **Session expiry mid-review:** non-destructive — autosaved notes (Pattern 1) survive; on a Pattern-2 action against an expired session, the reason dialog surfaces `Session expirée — reconnexion requise` before any write, draft preserved.
- **Stale dossier (data changed server-side while open):** on Valider, if the underlying eval changed since load → block with `L'évaluation a changé depuis l'ouverture. Recharger pour voir les écarts.` (extends the existing pre-assessment-overwrite guard, §Screen 5 edge cases).

---

## Responsive & accessibility

- **Min viewport:** 1280px (desktop tool; mobile explicitly out of scope). Below 1024px → "Karmen est optimisé pour le bureau" notice rather than a broken cramped layout. Workspace uses fixed sidebar (240px) + fluid main.
- **Keyboard navigation (first-class — Linear-grade):**
  - Queue: `↑/↓` move row focus, `Enter` opens, `/` focuses search, `f` filter. Roving tabindex within the list.
  - Within dossier: `g` then section initial (or `1–4`) jumps sections; `v` = Valider (with confirm); `e` = evidence on focused anomaly; `a` = annotate focused.
  - Focus order: top bar → group/section nav → primary content → row/card actions → footer CTA. Logical, top-to-bottom, left-to-right.
- **ARIA landmarks:** `banner` (top bar), `navigation` (queue groups / dossier sidebar), `main` (active section), `complementary` (audit trail). Section nav = `nav` with `aria-current` on active.
- **Status badges (screen reader):** `StatusBadge` renders visible text label + icon with `aria-label` combining status + context, e.g. `aria-label="Anomalie bloquante : ratio d'endettement"`. Never a color/dot with no accessible name (color-is-never-alone, §5/§7).
- **The score (screen reader):** announced as a full sentence, not "67": `aria-label="Score 67 sur 100, catégorie B, risque modéré, confiance modérée"`. The hero number is `aria-hidden` decorative; the label carries truth.
- **Color contrast:** all status text on `-bg` surfaces ≥ WCAG AA 4.5:1; focus ring uses `--ring` at ≥3:1 against adjacent colors; never rely on color alone for any state.
- **Touch targets:** primary actions (`Valider`, row open, evidence link) ≥ 44×44px even though desktop — keeps the dense rows at 44px and helps trackpad/precision-impaired users.
- **Motion:** respect `prefers-reduced-motion`; collapsibles snap rather than animate when set.

---

## Open design decisions (recommendations to confirm)

Each is a genuine choice for the human reviewer. Format: **my recommendation** · alternative · why.

**Q1 — Can the analyst override the verdict? · ✅ RESOLVED (2026-06-22)**
**Decision: Yes — override is first-class (`OverrideControl`), on *any* verdict (including blocking), always with a required reason, always audited.** Override supersedes the system's original verdict visibly but never deletes it. Rejected: comment-only (an expert who can't override won't adopt) and non-blocking-only (would trap valid judgment on real blockers). *Anchors P4 + T3 — "judgment wins" is the product thesis.*

**Q2 — Bank connection fails mid-dossier (degraded state)?**
**Recommend: Degrade gracefully — affected source goes `failed`, gate drops to "Incomplet — action requise", offer retry + manual-upload `fallback`; other sources and computed sections stay live.** Alt: invalidate the whole dossier. Why: T5 honesty + don't destroy completed work; the repli (manual upload) is already the legal fallback in CADRAGE.

**Q3 — Unit of analysis: dossier or period (flat / grouped / timeline)?**
**Recommend: Dossier is the unit; indicators are flat + severity-grouped, with period shown as evidence context, not as the primary axis.** Alt: timeline/period-first view. Why: the JTBD is "decide creditworthiness," a per-dossier verdict; period matters only when drilling into an anomaly's evidence. Timeline is a v2 power-feature, not v0.

**Q4 — Action on hidden-account flag?**
**Recommend: Two actions — "Demander la connexion" (primary, re-engages client) + "Marquer comme hors périmètre" (requires reason, audited).** Alt: informational flag only. Why: T7 surfaces it; P4 lets judgment dispose of it; a flag with no action is a dead end that erodes trust.

**Q5 — Is the pre-assessment editable (= credit note draft)?**
**Recommend: Yes — editable in place, and it IS the seed of the credit note (CADRAGE §4 explicit).** Alt: read-only system text. Why: P6 + the roadmap — "on passe de la rédaction à la relecture." Editing is attributed; warn before overwriting if upstream data changes.

**Q6 — What changes the confidence signal? · ✅ RESOLVED (2026-06-22)**
**Decision: Confidence is a STATIC signal for the session** = function of (data depth/recency, calibration density for similar dossiers, factor agreement); the dominant reason is always shown inline. It does **not** recompute as the analyst annotates/overrides. Rejected: dynamic recompute (a moving trust signal is hard to read and feels like the system second-guessing the human) and data-depth-only (ignores calibration, weakens T6). Short history (10mo) → modérée, with that exact reason shown. *Anchors T5 — honest, learnable, predictable.*

**Q7 — Multi-analyst queue (claimed state)?**
**Recommend: Add a lightweight `claimed` state — opening a dossier soft-claims it (avatar in queue row), others get read-only with "reprendre la main" option.** Alt: ignore concurrency for v0. Why: realistic team context + prevents two analysts duplicating 30min of work; cheap to add as a queue-row signal. Flag: confirm team size justifies it for v0.

**Q8 — Minimum data to show a score (not-enough-data state)? · ✅ RESOLVED (2026-06-22)**
**Decision: A HARD floor — below it, NO number; show "Score indisponible — données insuffisantes" + what's missing + link to Complétude.** Above the floor but thin → show number + conf faible/modérée with the reason inline. Rejected: always-show-a-number (invites over-trust in a fragile number). *Anchors T5 + P2 — a misleading precise number is worse than an honest gap.*
> ⚠️ **Open input (not a design choice — a credit-policy number):** the exact floor and thin-band thresholds (placeholder: floor = ?, thin band = 8–11 months) must be confirmed with credit policy before build. The *design* is locked; the *number* is a TODO. See TODOS.md.

---

## NOT in scope (deliberately deferred)

- **Étape 4 — Recommandation UI.** Greyed nav placeholder only; full template screen is v2. *Rationale: out of PM scope; pre-assessment (Q5) already seeds it.*
- **v2.5 AI-assisted draft.** *Rationale: trust must be established first (CADRAGE).*
- **Client onboarding / connection UI.** *Rationale: analyst-facing app only; client side is a separate product surface.*
- **Mobile / responsive below 1024px.** *Rationale: desktop professional tool; a notice replaces a cramped layout.*
- **Dark mode polish.** Tokens exist in globals.css; we ship light-first and verify dark, but don't design dark-specific layouts in v0. *Rationale: focus on the one viewing context analysts use.*
- **Timeline / period-axis analysis view (Q3 alt).** *Rationale: v2 power feature once the dossier-verdict path is solid.*
- **Bulk actions in queue (multi-select validate).** *Rationale: review-by-exception means each clean dossier is already ~5s; bulk risks rubber-stamping, which fights T1–T4.*
