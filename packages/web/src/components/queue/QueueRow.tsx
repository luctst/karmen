import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { StatusBadge } from "@karmen/ui/components/status-badge"
import { cn } from "@karmen/ui/lib/utils"

import type { DossierSummary } from "../api/types"
import { badgeFor } from "../screens/queue/grouping"
import { scoreDisplay } from "../screens/queue/score"

/**
 * QueueRow — one dossier in the triage list. The whole row is a single link
 * (keyboard accessible, focus-visible ring, Enter opens). Layout, left to
 * right: dominant StatusBadge · company name (truncate + title tooltip) ·
 * score + category (mono tabular) · business type meta · open affordance.
 */

type QueueRowProps = {
  dossier: DossierSummary
}

export function QueueRow({ dossier }: QueueRowProps) {
  const badge = badgeFor(dossier)
  const score = scoreDisplay(dossier.score)

  return (
    <Link
      to={`/dossiers/${dossier.id}`}
      role="listitem"
      className={cn(
        "group flex h-11 items-center gap-3 rounded-sm px-3 py-2 text-sm",
        "outline-none transition-colors hover:bg-accent",
        "focus-visible:ring-[2px] focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      )}
    >
      <div className="w-52 shrink-0">
        <StatusBadge
          status={badge.status}
          label={badge.label}
          context={badge.context}
        />
      </div>

      <span
        className="min-w-0 flex-1 truncate font-medium text-foreground"
        title={dossier.company.name}
      >
        {dossier.company.name}
      </span>

      <span className="w-44 shrink-0 text-right font-mono text-sm tabular-nums">
        <span className="sr-only">
          {score.isUnknown
            ? "Score indisponible"
            : `Score ${score.value} sur 100, catégorie ${score.category}, ${score.riskPhrase}`}
        </span>
        {score.isUnknown ? (
          <span aria-hidden="true" className="text-muted-foreground">
            — / —
          </span>
        ) : (
          <span aria-hidden="true">
            <span className="text-foreground">
              {score.value} / {score.category}
            </span>
            <span className="text-muted-foreground"> — {score.riskPhrase}</span>
          </span>
        )}
      </span>

      <span className="w-40 shrink-0 truncate text-right text-xs text-muted-foreground">
        {dossier.company.businessType}
      </span>

      <ChevronRight
        size={16}
        aria-hidden="true"
        className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
      />
    </Link>
  )
}
