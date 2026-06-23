import type { ComponentType, ReactNode } from "react"
import type { LucideProps } from "lucide-react"

type EmptyStateProps = {
  icon: ComponentType<LucideProps>
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <Icon
        size={28}
        className="text-muted-foreground"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
