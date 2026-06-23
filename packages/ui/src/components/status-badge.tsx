import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  CircleSlash,
  Clock,
  FileUp,
  Info,
  OctagonAlert,
  PlugZap,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@karmen/ui/lib/utils"

/**
 * StatusBadge — the single source of truth for status rendering (DESIGN.md
 * §6/§7). It is the ONLY component that paints a status color; nothing else
 * hand-rolls a colored chip.
 *
 * Color-is-never-alone (§5): every badge renders icon + text label + color,
 * always all three. An aria-label combines the status with the optional
 * context so a screen reader gets the full verdict.
 */

type StatusFamily = "clean" | "warn" | "block" | "neutral" | "info"

type StatusKey =
  | "clean"
  | "anomaly_notable"
  | "anomaly_blocking"
  | "anomaly_info"
  | "incomplete_action"
  | "incomplete_waiting"
  | "pending"
  | "decided"
  | "failed"
  | "fallback"
  | "conf_high"
  | "conf_med"
  | "conf_low"

type StatusDefinition = {
  family: StatusFamily
  label: string
  icon: LucideIcon
}

/** §7 status table. Extend here as new keys are needed app-wide. */
const STATUS: Record<StatusKey, StatusDefinition> = {
  clean: { family: "clean", label: "Propre", icon: CheckCircle2 },
  anomaly_notable: {
    family: "warn",
    label: "Anomalie",
    icon: AlertTriangle,
  },
  anomaly_blocking: {
    family: "block",
    label: "Anomalie bloquante",
    icon: OctagonAlert,
  },
  anomaly_info: { family: "info", label: "Informatif", icon: Info },
  incomplete_action: {
    family: "warn",
    label: "Incomplet — action requise",
    icon: CircleAlert,
  },
  incomplete_waiting: {
    family: "neutral",
    label: "Incomplet — en attente client",
    icon: Clock,
  },
  pending: { family: "neutral", label: "En attente", icon: Clock },
  decided: { family: "neutral", label: "Décidé", icon: CircleSlash },
  failed: { family: "block", label: "Échec connexion", icon: PlugZap },
  fallback: { family: "warn", label: "Repli", icon: FileUp },
  conf_high: { family: "clean", label: "Confiance élevée", icon: ShieldCheck },
  conf_med: { family: "warn", label: "Confiance modérée", icon: ShieldAlert },
  conf_low: { family: "block", label: "Confiance faible", icon: ShieldX },
}

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      family: {
        clean:
          "border-status-clean/20 bg-status-clean-bg text-status-clean-foreground",
        warn: "border-status-warn/25 bg-status-warn-bg text-status-warn-foreground",
        block:
          "border-status-block/20 bg-status-block-bg text-status-block-foreground",
        neutral:
          "border-status-neutral/20 bg-status-neutral-bg text-status-neutral-foreground",
        info: "border-status-info/20 bg-status-info-bg text-status-info-foreground",
      },
    },
    defaultVariants: {
      family: "neutral",
    },
  }
)

type StatusBadgeProps = Omit<React.ComponentProps<"span">, "children"> &
  VariantProps<typeof badgeVariants> & {
    status: StatusKey
    /** Optional override for the visible label (e.g. "Risque modéré"). */
    label?: string
    /** Context appended to the aria-label (e.g. "risque élevé"). */
    context?: string
  }

function StatusBadge({
  status,
  label,
  context,
  family: familyOverride,
  className,
  ...props
}: StatusBadgeProps) {
  const def = STATUS[status]
  const family = familyOverride ?? def.family
  const Icon = def.icon
  const text = label ?? def.label
  const ariaLabel = context ? `${def.label} : ${context}` : text

  return (
    <span
      data-slot="status-badge"
      data-status={status}
      aria-label={ariaLabel}
      className={cn(badgeVariants({ family }), className)}
      {...props}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{text}</span>
    </span>
  )
}

export { StatusBadge, badgeVariants }
export type { StatusBadgeProps, StatusKey, StatusFamily }
