import { CheckCircle2 } from "lucide-react"

import { useQueue } from "../../api/hooks"
import type { DossierSummary } from "../../api/types"
import { EmptyState } from "../../components/EmptyState"
import { ErrorBanner } from "../../components/ErrorBanner"
import { QueueRow } from "../../components/queue/QueueRow"
import { QueueSkeleton } from "../../components/queue/QueueSkeleton"
import { groupQueue } from "../../components/queue/grouping"
import type { QueueTier } from "../../components/queue/grouping"

// Neutral priority ticks: opacity (never status color) encodes actionability.
const TIER_TICK: Record<QueueTier, string> = {
  fast_close: "bg-foreground",
  exceptions: "bg-foreground/70",
  re_eval: "bg-foreground/50",
  awaiting_client: "bg-foreground/35",
  blocked: "bg-foreground/35",
  decided: "bg-foreground/25",
}

export function Queue() {
  const { data, isLoading, error, refetch } = useQueue()

  const count = data?.length ?? 0

  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="mx-auto min-w-[1024px] max-w-[1400px]">
        <TopBar count={count} isLoading={isLoading} hasError={Boolean(error)} />

        <main className="mx-6 my-4 rounded-lg border bg-card shadow-xs">
          {isLoading ? (
            <QueueSkeleton />
          ) : error ? (
            <div className="p-6">
              <ErrorBanner
                message="Impossible de charger la file."
                onRetry={refetch}
              />
            </div>
          ) : count === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              iconClassName="text-status-clean"
              title="Aucun dossier en attente."
              description="Tout est traité."
            />
          ) : (
            <QueueList dossiers={data ?? []} />
          )}
        </main>
      </div>
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
      className="sticky top-0 z-10 flex items-center gap-4 border-b bg-card/80 px-6 py-3 backdrop-blur-sm"
    >
      <span className="text-sm font-semibold tracking-tight text-brand">
        Karmen
      </span>
      <span aria-hidden="true" className="h-4 w-px bg-border" />
      <h1 className="text-sm font-semibold text-foreground">File d'attente</h1>
      <span className="ml-auto text-xs text-muted-foreground">
        {isLoading || hasError ? (
          <span className="font-mono tabular-nums">— dossiers</span>
        ) : (
          <>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {count}
            </span>{" "}
            dossier{count > 1 ? "s" : ""} · triés par priorité d'action
          </>
        )}
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
    <nav
      aria-label="File des dossiers, triés par priorité d'action"
      className="p-3"
    >
      {groups.map((group, index) => (
        <section
          key={group.tier}
          className={index > 0 ? "mt-6 border-t pt-6" : undefined}
        >
          <h2 className="mb-2 flex items-center gap-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span
              aria-hidden="true"
              className={`h-3 w-0.5 rounded-full ${TIER_TICK[group.tier]}`}
            />
            {group.label}
            <span className="rounded-full bg-muted px-1.5 text-[11px] font-mono tabular-nums text-muted-foreground">
              {group.dossiers.length}
            </span>
          </h2>
          <div role="list" className="space-y-0.5">
            {group.dossiers.map((dossier) => (
              <QueueRow key={dossier.id} dossier={dossier} />
            ))}
          </div>
        </section>
      ))}
    </nav>
  )
}
