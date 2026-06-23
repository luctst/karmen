/**
 * QueueSkeleton — loading placeholder that preserves the list layout (no
 * spinner-on-blank). A single skeleton group header + several row-height
 * pulses (~44px). aria-busy announces the in-flight load.
 */

const ROW_COUNT = 7

export function QueueSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement de la file" className="px-6">
      <div className="mb-2 h-4 w-40 animate-pulse rounded-sm bg-muted" />
      <div className="space-y-1">
        {Array.from({ length: ROW_COUNT }).map((_, index) => (
          <div
            key={`queue-skeleton-${index}`}
            className="flex h-11 items-center gap-3 px-3 py-2"
          >
            <div className="h-5 w-52 shrink-0 animate-pulse rounded-sm bg-muted" />
            <div className="h-4 flex-1 animate-pulse rounded-sm bg-muted" />
            <div className="h-4 w-44 shrink-0 animate-pulse rounded-sm bg-muted" />
            <div className="h-4 w-40 shrink-0 animate-pulse rounded-sm bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
