import { CheckCircle2, ChevronRight, LineChart } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@karmen/ui/components/card"

import type { DossierAnalyse } from "../../../api/types"
import { EmptyState } from "../../EmptyState"
import { AnomalyCard } from "./AnomalyCard"
import { IndicatorTable } from "./IndicatorTable"

type AnalyseSectionProps = {
  analyse: DossierAnalyse | null
}

const SEVERITY_ORDER = { blocking: 0, notable: 1, info: 2, conforme: 3 } as const

export function AnalyseSection({ analyse }: AnalyseSectionProps) {
  if (!analyse) {
    return (
      <section aria-label="Analyse financière" className="space-y-6">
        <EmptyState
          icon={LineChart}
          title="Analyse indisponible."
          description="L'analyse sera disponible une fois le dossier complet."
        />
      </section>
    )
  }

  const anomalies = analyse.indicators
    .filter((indicator) => indicator.status !== "conforme")
    .sort((a, b) => SEVERITY_ORDER[a.status] - SEVERITY_ORDER[b.status])

  const conforming = analyse.indicators.filter(
    (indicator) => indicator.status === "conforme"
  )

  return (
    <section aria-label="Analyse financière" className="space-y-6">
      <Card className="gap-3 py-4 shadow-none">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Pré-évaluation</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <p className="text-sm leading-relaxed text-foreground">
            {analyse.preAssessment}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Anomalies ({anomalies.length})
        </h2>
        {anomalies.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-status-clean/20 bg-status-clean-bg px-4 py-3 text-sm text-status-clean-foreground">
            <CheckCircle2 size={16} aria-hidden="true" className="shrink-0" />
            Aucune anomalie. {conforming.length} indicateurs conformes.
          </div>
        ) : (
          <div className="space-y-4">
            {anomalies.map((indicator) => (
              <AnomalyCard key={indicator.id} indicator={indicator} />
            ))}
          </div>
        )}
      </div>

      {conforming.length > 0 ? (
        <details className="group rounded-lg border bg-card">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground outline-none focus-visible:ring-[2px] focus-visible:ring-ring">
            <ChevronRight
              size={16}
              aria-hidden="true"
              className="shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
            />
            {conforming.length} indicateurs conformes
          </summary>
          <div className="border-t border-border px-1 py-1">
            <IndicatorTable indicators={analyse.indicators} />
          </div>
        </details>
      ) : null}
    </section>
  )
}
