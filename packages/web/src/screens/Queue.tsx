import { CheckCircle2 } from "lucide-react"

import { useQueue } from "../api/hooks"
import type { DossierSummary } from "../api/types"
import { EmptyState } from "../components/EmptyState"
import { ErrorBanner } from "../components/ErrorBanner"
import { QueueRow } from "../components/QueueRow"
import { QueueSkeleton } from "../components/QueueSkeleton"
import { groupQueue } from "./queue/grouping"

/**
 * Queue (Screen 1) — the triage surface. Container owns the data fetch and
 * the loading / empty / error / success switch; presentation lives in the
 * small components below and in QueueRow.
 */
export function Queue() {
  const { data, isLoading, error, refetch } = useQueue()

  const count = data?.length ?? 0

  return (
    <div className="mx-auto min-w-[1024px] max-w-[1400px]">
      <TopBar count={count} isLoading={isLoading} hasError={Boolean(error)} />

      <main className="py-4">
        {isLoading ? (
          <QueueSkeleton />
        ) : error ? (
          <ErrorBanner
            message="Impossible de charger la file."
            onRetry={refetch}
          />
        ) : count === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Aucun dossier en attente."
            description="Tout est traité."
          />
        ) : (
          <QueueList dossiers={data ?? []} />
        )}
      </main>
    </div>
  )
}

type TopBarProps = {
  count: number
  isLoading: boolean
  hasError: boolean
}

function TopBar({ count, isLoading, hasError }: TopBarProps) {
  return (
    <header
      role="banner"
      className="flex items-center gap-4 border-b px-6 py-3"
    >
      <span className="text-sm font-semibold text-foreground">Karmen</span>
      <span className="text-muted-foreground">·</span>
      <h1 className="text-sm font-semibold text-foreground">File d'attente</h1>
      <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
        {isLoading || hasError
          ? "— dossiers"
          : `${count} dossier${count > 1 ? "s" : ""} · triés par priorité d'action`}
      </span>
    </header>
  )
}

type QueueListProps = {
  dossiers: DossierSummary[]
}

function QueueList({ dossiers }: QueueListProps) {
  const groups = groupQueue(dossiers)

  return (
    <nav aria-label="File des dossiers, triés par priorité d'action">
      <div className="space-y-6 px-6">
        {groups.map((group) => (
          <section key={group.tier}>
            <h2 className="mb-2 flex items-baseline gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group.label}
              <span className="font-mono tabular-nums">
                ({group.dossiers.length})
              </span>
            </h2>
            <div role="list" className="space-y-0.5">
              {group.dossiers.map((dossier) => (
                <QueueRow key={dossier.id} dossier={dossier} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </nav>
  )
}
