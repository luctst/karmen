import type { StatusKey } from "@karmen/ui/components/status-badge"

import type { DossierSummary } from "../../api/types"

export type QueueTier =
  | "fast_close"
  | "exceptions"
  | "re_eval"
  | "awaiting_client"
  | "blocked"
  | "decided"

export type QueueGroup = {
  tier: QueueTier
  label: string
  dossiers: DossierSummary[]
}

const TIER_ORDER: QueueTier[] = [
  "fast_close",
  "exceptions",
  "re_eval",
  "awaiting_client",
  "blocked",
  "decided",
]

const TIER_LABELS: Record<QueueTier, string> = {
  fast_close: "Clôtures rapides",
  exceptions: "Exceptions à examiner",
  re_eval: "En attente de ré-éval",
  awaiting_client: "En attente client",
  blocked: "Bloqués",
  decided: "Décidés",
}

export function tierFor(dossier: DossierSummary): QueueTier {
  const { status, score } = dossier

  switch (status) {
    case "pending_review":
      return score?.riskBucket === "low" ? "fast_close" : "exceptions"
    case "info_requested":
      return "re_eval"
    case "awaiting_client":
      return "awaiting_client"
    case "blocked":
      return "blocked"
    case "approved":
    case "rejected":
      return "decided"
    default:
      return "decided"
  }
}

export function groupQueue(dossiers: DossierSummary[]): QueueGroup[] {
  const buckets = new Map<QueueTier, DossierSummary[]>()

  for (const dossier of dossiers) {
    const tier = tierFor(dossier)
    const existing = buckets.get(tier)
    if (existing) {
      existing.push(dossier)
    } else {
      buckets.set(tier, [dossier])
    }
  }

  return TIER_ORDER.flatMap((tier) => {
    const group = buckets.get(tier)
    if (!group || group.length === 0) return []
    return [{ tier, label: TIER_LABELS[tier], dossiers: group }]
  })
}

export function badgeFor(dossier: DossierSummary): {
  status: StatusKey
  label: string
  context: string
} {
  const { status, score } = dossier
  const risk = score?.riskBucket

  switch (status) {
    case "pending_review":
      if (!risk)
        return {
          status: "incomplete_action",
          label: "Action requise",
          context: "score à calculer",
        }
      if (risk === "low")
        return { status: "clean", label: "Propre", context: "risque faible" }
      if (risk === "medium")
        return {
          status: "anomaly_notable",
          label: "Risque modéré",
          context: "risque modéré",
        }
      return {
        status: "anomaly_blocking",
        label: "Risque élevé",
        context: "risque élevé",
      }
    case "awaiting_client":
      return {
        status: "incomplete_waiting",
        label: "En attente client",
        context: "en attente client",
      }
    case "info_requested":
      return {
        status: "pending",
        label: "Ré-éval demandée",
        context: "ré-évaluation",
      }
    case "blocked":
      return {
        status: "anomaly_blocking",
        label: "Bloqué",
        context: "dossier bloqué",
      }
    case "approved":
      return { status: "clean", label: "Validé", context: "dossier validé" }
    case "rejected":
      return { status: "decided", label: "Refusé", context: "refusé" }
    default:
      return { status: "pending", label: "En attente", context: "" }
  }
}
