import { ArrowDown, ArrowUp } from "lucide-react"

import type { ScoreFactor } from "../../../api/types"

type ScoreFactorListProps = {
  factors: ScoreFactor[]
}

function weightLabel(weight: number): string {
  if (weight >= 67) return "fort"
  if (weight >= 34) return "moyen"
  return "faible"
}

export function ScoreFactorList({ factors }: ScoreFactorListProps) {
  return (
    <ul className="space-y-2">
      {factors.map((factor) => {
        const isUp = factor.direction === "up"
        const Arrow = isUp ? ArrowUp : ArrowDown

        return (
          <li key={factor.id} className="flex items-center gap-3 text-sm">
            <Arrow
              size={16}
              aria-hidden="true"
              className={
                isUp
                  ? "shrink-0 text-status-clean-foreground"
                  : "shrink-0 text-status-block-foreground"
              }
            />
            <span className="min-w-0 flex-1 truncate text-foreground">
              {factor.label}
            </span>
            <span
              aria-hidden="true"
              className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-muted"
            >
              <span
                className="block h-full rounded-full bg-foreground/70"
                style={{ width: `${Math.min(100, Math.max(0, factor.weight))}%` }}
              />
            </span>
            <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
              {weightLabel(factor.weight)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
