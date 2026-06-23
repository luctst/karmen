import type { StatusKey } from "@karmen/ui/components/status-badge"
import { StatusBadge } from "@karmen/ui/components/status-badge"

import type { Indicator, IndicatorStatus } from "../../../api/types"

type IndicatorTableProps = {
  indicators: Indicator[]
}

const STATUS: Record<IndicatorStatus, { status: StatusKey; label: string }> = {
  conforme: { status: "clean", label: "Conforme" },
  notable: { status: "anomaly_notable", label: "Notable" },
  blocking: { status: "anomaly_blocking", label: "Bloquant" },
  info: { status: "anomaly_info", label: "Informatif" },
}

export function IndicatorTable({ indicators }: IndicatorTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left">
          <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Indicateur
          </th>
          <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Valeur
          </th>
          <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Seuil
          </th>
          <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Statut
          </th>
        </tr>
      </thead>
      <tbody>
        {indicators.map((indicator) => {
          const status = STATUS[indicator.status]

          return (
            <tr key={indicator.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2 text-foreground">{indicator.label}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                {indicator.value}
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                {indicator.threshold ?? "—"}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={status.status} label={status.label} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
