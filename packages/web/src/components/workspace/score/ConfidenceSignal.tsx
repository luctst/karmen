import type { StatusKey } from "@karmen/ui/components/status-badge"
import { StatusBadge } from "@karmen/ui/components/status-badge"

import type { Confidence } from "../../../api/types"

type ConfidenceSignalProps = {
  confidence: Confidence
  reason: string | null
}

const SIGNAL: Record<Confidence, { status: StatusKey; label: string }> = {
  high: { status: "conf_high", label: "Confiance élevée" },
  medium: { status: "conf_med", label: "Confiance modérée" },
  low: { status: "conf_low", label: "Confiance faible" },
}

export function ConfidenceSignal({
  confidence,
  reason,
}: ConfidenceSignalProps) {
  const signal = SIGNAL[confidence]

  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <StatusBadge status={signal.status} label={signal.label} />
      {reason ? (
        <p className="max-w-xs text-xs leading-snug text-muted-foreground">
          « {reason} »
        </p>
      ) : null}
    </div>
  )
}
