import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { StatusBadge } from "@karmen/ui/components/status-badge"

import type { DossierAggregate } from "../../api/types"
import { scoreDisplay } from "../queue/score"
import { verdictBadge } from "./dossierBadge"

type WorkspaceHeaderProps = {
  dossier: DossierAggregate
}

export function WorkspaceHeader({ dossier }: WorkspaceHeaderProps) {
  const badge = verdictBadge(dossier)
  const score = scoreDisplay(dossier.score)

  return (
    <header
      role="banner"
      className="sticky top-0 z-10 flex items-center gap-4 border-b bg-card/80 px-6 py-3 backdrop-blur-sm"
    >
      <Link
        to="/"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-sm text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[2px] focus-visible:ring-ring"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        File d'attente
      </Link>

      <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />

      <div className="flex min-w-0 items-baseline gap-3">
        <h1
          className="truncate text-xl font-semibold leading-tight text-foreground"
          title={dossier.company.name}
        >
          {dossier.company.name}
        </h1>
        <span className="shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
          {dossier.company.siren}
        </span>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <StatusBadge
          status={badge.status}
          label={badge.label}
          context={badge.context}
        />
        <span className="text-right">
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
            <span
              aria-hidden="true"
              className="font-mono text-[15px] font-semibold tabular-nums text-foreground"
            >
              {score.value} / {score.category}
            </span>
          )}
        </span>
      </div>
    </header>
  )
}
