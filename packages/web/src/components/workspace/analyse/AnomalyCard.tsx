import { CornerDownRight } from "lucide-react"

import type { StatusKey } from "@karmen/ui/components/status-badge"
import { StatusBadge } from "@karmen/ui/components/status-badge"
import { cn } from "@karmen/ui/lib/utils"

import type { Indicator, IndicatorStatus } from "../../../api/types"

type AnomalyCardProps = {
  indicator: Indicator
}

const SEVERITY: Record<
  Exclude<IndicatorStatus, "conforme">,
  { status: StatusKey; border: string }
> = {
  blocking: { status: "anomaly_blocking", border: "border-l-status-block" },
  notable: { status: "anomaly_notable", border: "border-l-status-warn" },
  info: { status: "anomaly_info", border: "border-l-status-info" },
}

export function AnomalyCard({ indicator }: AnomalyCardProps) {
  if (indicator.status === "conforme") return null

  const severity = SEVERITY[indicator.status]

  return (
    <article
      className={cn(
        "rounded-lg border border-l-2 bg-card p-4",
        severity.border
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            {indicator.label}
          </h3>
          <p className="mt-1 font-mono text-sm tabular-nums text-foreground">
            {indicator.value}
            {indicator.threshold ? (
              <span className="text-muted-foreground">
                {" "}
                · seuil {indicator.threshold}
              </span>
            ) : null}
          </p>
        </div>
        <StatusBadge status={severity.status} context={indicator.label} />
      </div>

      {indicator.mitigants.length > 0 ? (
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
          {indicator.mitigants.map((mitigant) => (
            <li
              key={mitigant.id}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <CornerDownRight
                size={14}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              <span className="min-w-0">{mitigant.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          Aucun mitigant identifié.
        </p>
      )}
    </article>
  )
}
