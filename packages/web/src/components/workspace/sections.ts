import {
  ClipboardList,
  FileText,
  Gauge,
  LineChart,
  ListChecks,
  type LucideIcon,
} from "lucide-react"

import type { StatusKey } from "@karmen/ui/components/status-badge"

import type {
  Confidence,
  DossierAggregate,
  GateStatus,
} from "../../api/types"

export type SectionKey = "overview" | "completeness" | "score" | "analysis"

export type SectionNav = {
  key: SectionKey
  label: string
  icon: LucideIcon
}

export const SECTIONS: SectionNav[] = [
  { key: "overview", label: "Aperçu", icon: ClipboardList },
  { key: "completeness", label: "Complétude", icon: ListChecks },
  { key: "score", label: "Score", icon: Gauge },
  { key: "analysis", label: "Analyse financière", icon: LineChart },
]

export const FUTURE_SECTION = {
  key: "recommendation",
  label: "Recommandation",
  icon: FileText,
}

type SectionStatus = {
  status: StatusKey
  label: string
} | null

const COMPLETENESS_STATUS: Record<GateStatus, SectionStatus> = {
  complet: { status: "clean", label: "Complet" },
  action_requise: { status: "incomplete_action", label: "Action requise" },
  attente_client: { status: "incomplete_waiting", label: "En attente client" },
}

const SCORE_STATUS: Record<Confidence, SectionStatus> = {
  high: { status: "conf_high", label: "Confiance élevée" },
  medium: { status: "conf_med", label: "Confiance modérée" },
  low: { status: "conf_low", label: "Confiance faible" },
}

export function sectionStatus(
  key: SectionKey,
  dossier: DossierAggregate
): SectionStatus {
  switch (key) {
    case "completeness":
      return dossier.completeness
        ? COMPLETENESS_STATUS[dossier.completeness.gateStatus]
        : null
    case "score":
      return dossier.score ? SCORE_STATUS[dossier.score.confidence] : null
    case "analysis": {
      if (!dossier.analyse) return null
      const anomalies = dossier.analyse.indicators.filter(
        (indicator) => indicator.status !== "conforme"
      )
      if (anomalies.length === 0) return { status: "clean", label: "Conforme" }
      return {
        status: anomalies.some((a) => a.status === "blocking")
          ? "anomaly_blocking"
          : "anomaly_notable",
        label: `${anomalies.length} anomalie${anomalies.length > 1 ? "s" : ""}`,
      }
    }
    default:
      return null
  }
}
