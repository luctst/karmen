import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@karmen/ui/components/button"
import { StatusBadge } from "@karmen/ui/components/status-badge"

import { useDecision } from "../../api/hooks"
import type { DecisionKind, DossierAggregate } from "../../api/types"
import { scoreDisplay } from "../queue/score"
import { verdictBadge } from "./dossierBadge"

type WorkspaceHeaderProps = {
  dossierId: string | undefined
  dossier: DossierAggregate
}

export function WorkspaceHeader({ dossierId, dossier }: WorkspaceHeaderProps) {
  const navigate = useNavigate()
  const { decide, isPending, error } = useDecision(dossierId)
  const [active, setActive] = useState<DecisionKind | null>(null)

  const badge = verdictBadge(dossier)
  const score = scoreDisplay(dossier.score)

  const status = dossier.financingRequest.status
  const isDecided = status === "approved" || status === "rejected"

  async function onDecide(decision: DecisionKind) {
    setActive(decision)
    try {
      await decide({ decision })
      navigate("/")
    } catch {
      setActive(null)
    }
  }

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

        <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />

        {isDecided ? (
          <StatusBadge
            status={status === "approved" ? "clean" : "decided"}
            label={status === "approved" ? "Validé" : "Refusé"}
          />
        ) : (
          <div className="flex items-center gap-2">
            {error ? (
              <span
                role="alert"
                className="text-xs text-status-block-foreground"
              >
                Échec — aucune décision enregistrée.
              </span>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => onDecide("request_info")}
            >
              {active === "request_info" && isPending ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : null}
              Demander des informations
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => onDecide("reject")}
            >
              {active === "reject" && isPending ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : null}
              Refuser
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => onDecide("approve")}
            >
              {active === "approve" && isPending ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : null}
              Valider
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
