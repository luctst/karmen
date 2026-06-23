import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { StatusBadge } from "@karmen/ui/components/status-badge"
import { cn } from "@karmen/ui/lib/utils"

import type { DossierSummary } from "../../api/types"
import { badgeFor } from "./grouping"
import { scoreDisplay } from "./score"

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
        "group relative flex h-11 items-center gap-3 rounded-sm px-3 py-2 text-sm",
        "outline-none transition-colors duration-150 motion-reduce:transition-none",
        "hover:bg-surface-row-hover active:bg-muted",
        "before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-transparent group-hover:before:bg-brand",
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
        className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground"
        title={dossier.company.name}
      >
        {dossier.company.name}
      </span>

      <span className="w-28 shrink-0 text-right">
        <span className="sr-only">
          {score.isUnknown
            ? "Score indisponible"
            : `Score ${score.value} sur 100, catégorie ${score.category}, ${score.riskPhrase}`}
        </span>
        {score.isUnknown ? (
          <span
            aria-hidden="true"
            className="font-mono text-sm tabular-nums text-muted-foreground"
          >
            — / —
          </span>
        ) : (
          <span aria-hidden="true">
            <span className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
              {score.value} / {score.category}
            </span>
          </span>
        )}
      </span>

      <span className="w-40 shrink-0 truncate text-right text-xs text-muted-foreground">
        {dossier.company.businessType}
      </span>

      <ChevronRight
        size={16}
        aria-hidden="true"
        className="shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-brand-muted motion-reduce:transition-none"
      />
    </Link>
  )
}
