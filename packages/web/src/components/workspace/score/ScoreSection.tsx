import { Info, ListChecks } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@karmen/ui/components/card"

import type { DossierScoreDetail } from "../../../api/types"
import { EmptyState } from "../../EmptyState"
import { scoreDisplay } from "../../queue/score"
import { ConfidenceSignal } from "./ConfidenceSignal"
import { ScoreFactorList } from "./ScoreFactorList"

type ScoreSectionProps = {
  score: DossierScoreDetail | null
}

export function ScoreSection({ score }: ScoreSectionProps) {
  if (!score) {
    return (
      <section aria-label="Score" className="space-y-6">
        <EmptyState
          icon={Info}
          title="Score indisponible — données insuffisantes."
          description="Le score sera calculé une fois le dossier complet."
        />
      </section>
    )
  }

  const display = scoreDisplay(score)

  return (
    <section aria-label="Score" className="space-y-6">
      <Card className="gap-3 py-4 shadow-none">
        <CardContent className="flex items-start justify-between gap-4 px-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-4xl font-semibold leading-none tabular-nums text-foreground">
              {display.value}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
            <span className="text-sm font-medium text-foreground">
              {display.category} — {display.riskPhrase}
            </span>
          </div>
          <ConfidenceSignal
            confidence={score.confidence}
            reason={score.confidenceReason}
          />
        </CardContent>
      </Card>

      <Card className="gap-3 py-4 shadow-none">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Facteurs déterminants</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {score.factors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun facteur déterminant.
            </p>
          ) : (
            <ScoreFactorList factors={score.factors} />
          )}
        </CardContent>
      </Card>

      {score.checkItems.length > 0 ? (
        <Card className="gap-3 py-4 shadow-none">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Quoi vérifier</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <ul className="space-y-2">
              {score.checkItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2.5 text-sm text-foreground"
                >
                  <ListChecks
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0">{item.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {score.calibrationNote ? (
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>{score.calibrationNote}</span>
        </p>
      ) : null}
    </section>
  )
}
