import type { StatusKey } from "@karmen/ui/components/status-badge"
import { StatusBadge } from "@karmen/ui/components/status-badge"

import type { GateStatus } from "../../../api/types"

type CompletenessGateProps = {
  gateStatus: GateStatus
}

const GATE: Record<GateStatus, { status: StatusKey; label: string }> = {
  complet: { status: "clean", label: "Complet — dossier analysable" },
  action_requise: {
    status: "incomplete_action",
    label: "Incomplet — action requise",
  },
  attente_client: {
    status: "incomplete_waiting",
    label: "Incomplet — en attente client",
  },
}

export function CompletenessGate({ gateStatus }: CompletenessGateProps) {
  const gate = GATE[gateStatus]

  return (
    <div className="rounded-lg border bg-card p-4">
      <StatusBadge status={gate.status} label={gate.label} />
    </div>
  )
}
