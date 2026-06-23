import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@karmen/ui/components/card"
import { StatusBadge } from "@karmen/ui/components/status-badge"

import type { DossierAggregate, DossierFinancingRequest } from "../../../api/types"
import { verdictBadge } from "../dossierBadge"
import {
  financingTypeLabel,
  formatDuration,
  formatEuros,
  formatRate,
} from "../format"
import { Field } from "./Field"

type FinancingCardProps = {
  request: DossierFinancingRequest
  dossier: DossierAggregate
}

export function FinancingCard({ request, dossier }: FinancingCardProps) {
  const badge = verdictBadge(dossier)

  return (
    <Card className="gap-3 py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Demande de financement</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <dl className="divide-y divide-border">
          <Field label="Type" value={financingTypeLabel(request.type)} />
          <Field
            label="Statut"
            value={
              <span className="flex justify-end">
                <StatusBadge
                  status={badge.status}
                  label={badge.label}
                  context={badge.context}
                />
              </span>
            }
          />
          <Field label="Montant" value={formatEuros(request.amount)} mono />
          <Field
            label="Durée"
            value={formatDuration(request.durationInMonth)}
            mono
          />
          {request.interestRate !== null ? (
            <Field label="Taux" value={formatRate(request.interestRate)} mono />
          ) : null}
          {request.fundUsage ? (
            <Field label="Usage" value={request.fundUsage} />
          ) : null}
          {request.rejectedReason ? (
            <Field label="Motif de refus" value={request.rejectedReason} />
          ) : null}
        </dl>
      </CardContent>
    </Card>
  )
}
