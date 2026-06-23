export function WorkspaceSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Chargement du dossier"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard rows={6} />
        <SkeletonCard rows={5} />
      </div>
      <SkeletonCard rows={2} />
      <SkeletonCard rows={3} />
    </div>
  )
}

type SkeletonCardProps = {
  rows: number
}

function SkeletonCard({ rows }: SkeletonCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-4 h-4 w-32 animate-pulse rounded-full bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`skeleton-row-${index}`}
            className="flex items-center justify-between gap-4"
          >
            <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
