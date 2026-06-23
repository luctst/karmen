import type { ReactNode } from "react"

import { cn } from "@karmen/ui/lib/utils"

type FieldProps = {
  label: string
  value: ReactNode
  mono?: boolean
}

export function Field({ label, value, mono = false }: FieldProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 truncate text-right text-sm text-foreground",
          mono && "font-mono font-medium tabular-nums"
        )}
      >
        {value}
      </dd>
    </div>
  )
}
