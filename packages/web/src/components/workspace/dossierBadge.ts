import type { StatusKey } from "@karmen/ui/components/status-badge"

import type { DossierAggregate, DossierSummary } from "../../api/types"
import { badgeFor } from "../queue/grouping"

export function verdictBadge(dossier: DossierAggregate): {
  status: StatusKey
  label: string
  context: string
} {
  const summaryLike = {
    status: dossier.financingRequest.status,
    score: dossier.score,
  } as DossierSummary

  return badgeFor(summaryLike)
}
