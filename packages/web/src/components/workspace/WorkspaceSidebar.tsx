import { StatusBadge } from "@karmen/ui/components/status-badge"
import { cn } from "@karmen/ui/lib/utils"

import type { DossierAggregate } from "../../api/types"
import {
  FUTURE_SECTION,
  SECTIONS,
  sectionStatus,
  type SectionKey,
} from "./sections"

type WorkspaceSidebarProps = {
  dossier: DossierAggregate | null
  active: SectionKey
  onSelect: (key: SectionKey) => void
}

export function WorkspaceSidebar({
  dossier,
  active,
  onSelect,
}: WorkspaceSidebarProps) {
  return (
    <nav
      aria-label="Sections du dossier"
      className="flex w-60 shrink-0 flex-col gap-0.5 px-4 py-4"
    >
      {SECTIONS.map((section) => {
        const isActive = section.key === active
        const status = dossier ? sectionStatus(section.key, dossier) : null

        return (
          <button
            key={section.key}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSelect(section.key)}
            className={cn(
              "relative flex items-center gap-2.5 rounded-sm px-3 py-2 text-left text-sm outline-none transition-colors",
              "focus-visible:ring-[2px] focus-visible:ring-ring",
              isActive
                ? "bg-brand/5 font-medium text-brand before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-brand"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <section.icon size={20} aria-hidden="true" className="shrink-0" />
            <span className="flex-1 truncate">{section.label}</span>
            {status ? (
              <StatusBadge
                status={status.status}
                label={status.label}
                className="px-1.5 [&_svg]:size-3.5"
              />
            ) : null}
          </button>
        )
      })}

      <div
        aria-disabled="true"
        className="mt-1 flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted-foreground/60"
      >
        <FUTURE_SECTION.icon size={20} aria-hidden="true" />
        <span className="flex-1">{FUTURE_SECTION.label}</span>
        <span className="text-xs text-muted-foreground/60">à venir</span>
      </div>
    </nav>
  )
}
