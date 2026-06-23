import {
  ClipboardList,
  FileText,
  Gauge,
  LineChart,
  ListChecks,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@karmen/ui/lib/utils"

type Section = {
  key: string
  label: string
  icon: LucideIcon
}

const ACTIVE_SECTION: Section = {
  key: "overview",
  label: "Aperçu",
  icon: ClipboardList,
}

const FUTURE_SECTIONS: Section[] = [
  { key: "completeness", label: "Complétude", icon: ListChecks },
  { key: "score", label: "Score", icon: Gauge },
  { key: "analysis", label: "Analyse financière", icon: LineChart },
  { key: "recommendation", label: "Recommandation", icon: FileText },
]

export function WorkspaceSidebar() {
  return (
    <nav
      aria-label="Sections du dossier"
      className="flex w-60 shrink-0 flex-col gap-0.5 px-4 py-4"
    >
      <a
        href="#apercu"
        aria-current="page"
        className={cn(
          "relative flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium text-brand",
          "bg-brand/5 outline-none",
          "before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-brand",
          "focus-visible:ring-[2px] focus-visible:ring-ring"
        )}
      >
        <ACTIVE_SECTION.icon size={20} aria-hidden="true" />
        {ACTIVE_SECTION.label}
      </a>

      {FUTURE_SECTIONS.map((section) => (
        <div
          key={section.key}
          aria-disabled="true"
          className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted-foreground/60"
        >
          <section.icon size={20} aria-hidden="true" />
          <span className="flex-1">{section.label}</span>
          <span className="text-xs text-muted-foreground/60">à venir</span>
        </div>
      ))}
    </nav>
  )
}
