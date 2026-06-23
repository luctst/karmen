import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@karmen/ui/components/card"

import type { DossierScore } from "../../../api/types"
import { scoreDisplay } from "../../queue/score"

type ScoreCardProps = {
  score: (DossierScore & { id: string }) | null
}

export function ScoreCard({ score }: ScoreCardProps) {
  const display = scoreDisplay(score)

  return (
    <Card className="gap-3 py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Score</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {display.isUnknown ? (
          <p className="text-sm text-muted-foreground">
            Score non encore calculé.
          </p>
        ) : (
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-4xl font-semibold leading-none tabular-nums text-foreground">
              {display.value}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
            <span className="ml-auto text-sm font-medium text-foreground">
              {display.category} — {display.riskPhrase}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
