import { AlertTriangle, PlugZap } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@karmen/ui/components/card"

import type { DossierCompleteness } from "../../../api/types"
import { EmptyState } from "../../EmptyState"
import { formatDate } from "../format"
import { CompletenessGate } from "./CompletenessGate"
import { ConnectionStatusRow } from "./ConnectionStatusRow"

type CompletudeSectionProps = {
  completeness: DossierCompleteness | null
}

export function CompletudeSection({ completeness }: CompletudeSectionProps) {
  if (!completeness) {
    return (
      <section aria-label="Complétude" className="space-y-6">
        <EmptyState
          icon={PlugZap}
          title="Complétude indisponible."
          description="Aucune information de connexion n'est rattachée à ce dossier."
        />
      </section>
    )
  }

  return (
    <section aria-label="Complétude" className="space-y-6">
      <CompletenessGate gateStatus={completeness.gateStatus} />

      <Card className="gap-3 py-4 shadow-none">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Sources connectées</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {completeness.sources.length === 0 ? (
            <EmptyState
              icon={PlugZap}
              title="Aucune source."
              description="Aucune source n'a encore été connectée."
            />
          ) : (
            <ul className="divide-y divide-border">
              {completeness.sources.map((source) => (
                <ConnectionStatusRow key={source.id} source={source} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {completeness.hiddenAccounts.length > 0 ? (
        <Card className="gap-3 border-status-warn/25 py-4 shadow-none">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle
                size={16}
                aria-hidden="true"
                className="text-status-warn-foreground"
              />
              Détection compte caché
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <ul className="space-y-2">
              {completeness.hiddenAccounts.map((account) => (
                <li
                  key={account.id}
                  className="flex items-baseline justify-between gap-4 text-sm"
                >
                  <span className="min-w-0 text-foreground">
                    {account.pattern}
                  </span>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                    {account.ibanMasked}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Dernière relance :{" "}
        <span className="font-mono tabular-nums">
          {completeness.lastReminderAt
            ? formatDate(completeness.lastReminderAt)
            : "—"}
        </span>
      </p>
    </section>
  )
}
