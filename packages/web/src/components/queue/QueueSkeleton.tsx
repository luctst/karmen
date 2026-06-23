const ROW_COUNT = 7

export function QueueSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement de la file" className="p-3">
      <div className="mb-2 ml-3 h-4 w-40 animate-pulse rounded-full bg-muted" />
      <div className="space-y-0.5">
        {Array.from({ length: ROW_COUNT }).map((_, index) => (
          <div
            key={`queue-skeleton-${index}`}
            className="flex h-11 items-center gap-3 px-3 py-2"
          >
            <div className="h-5 w-52 shrink-0 animate-pulse rounded-sm bg-muted" />
            <div className="h-4 flex-1 animate-pulse rounded-sm bg-muted" />
            <div className="h-4 w-28 shrink-0 animate-pulse rounded-sm bg-muted" />
            <div className="h-4 w-40 shrink-0 animate-pulse rounded-sm bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
