import type { StatusKey } from "@karmen/ui/components/status-badge"
import { StatusBadge } from "@karmen/ui/components/status-badge"

import type { ConnectionSource, SourceState } from "../../../api/types"

type ConnectionStatusRowProps = {
  source: ConnectionSource
}

const STATE: Record<SourceState, { status: StatusKey; label: string }> = {
  connected: { status: "clean", label: "Connecté" },
  pending: { status: "pending", label: "En attente" },
  failed: { status: "failed", label: "Échec connexion" },
  fallback: { status: "fallback", label: "Repli" },
}

export function ConnectionStatusRow({ source }: ConnectionStatusRowProps) {
  const state = STATE[source.state]

  return (
    <li className="flex items-center gap-3 py-2">
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
        {source.label}
      </span>
      {source.detail ? (
        <span className="hidden shrink-0 font-mono text-xs tabular-nums text-muted-foreground sm:inline">
          {source.detail}
        </span>
      ) : null}
      <StatusBadge status={state.status} label={state.label} />
    </li>
  )
}
