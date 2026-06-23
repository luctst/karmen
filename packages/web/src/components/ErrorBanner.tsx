import { AlertTriangle } from "lucide-react"

import { Button } from "@karmen/ui/components/button"

type ErrorBannerProps = {
  message: string
  onRetry: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-sm border border-status-block/20 bg-status-block-bg px-3 py-2 text-sm text-status-block-foreground"
    >
      <AlertTriangle size={16} aria-hidden="true" className="shrink-0" />
      <span className="flex-1">{message}</span>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Réessayer
      </Button>
    </div>
  )
}
