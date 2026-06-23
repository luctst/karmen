import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { useDossier } from "../../api/hooks"
import type { DossierAggregate } from "../../api/types"
import { DossierOverview } from "../../components/workspace/DossierOverview"
import { WorkspaceHeader } from "../../components/workspace/WorkspaceHeader"
import { WorkspaceSidebar } from "../../components/workspace/WorkspaceSidebar"
import { WorkspaceSkeleton } from "../../components/workspace/WorkspaceSkeleton"
import { CompletudeSection } from "../../components/workspace/completude/CompletudeSection"
import { ScoreSection } from "../../components/workspace/score/ScoreSection"
import { AnalyseSection } from "../../components/workspace/analyse/AnalyseSection"
import type { SectionKey } from "../../components/workspace/sections"
import { ErrorBanner } from "../../components/ErrorBanner"

export function Workspace() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error, refetch } = useDossier(id)
  const [section, setSection] = useState<SectionKey>("overview")

  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="mx-auto min-w-[1024px] max-w-[1400px]">
        {data ? (
          <WorkspaceHeader dossierId={id} dossier={data} />
        ) : (
          <PlaceholderHeader />
        )}

        <div className="flex">
          <WorkspaceSidebar
            dossier={data}
            active={section}
            onSelect={setSection}
          />

          <main className="min-w-0 flex-1 px-6 py-6">
            <div className="rounded-lg border bg-card p-6 shadow-xs">
              {isLoading ? (
                <WorkspaceSkeleton />
              ) : error ? (
                <ErrorBanner
                  message="Impossible de charger le dossier."
                  onRetry={refetch}
                />
              ) : data ? (
                <SectionContent section={section} dossier={data} />
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

type SectionContentProps = {
  section: SectionKey
  dossier: DossierAggregate
}

function SectionContent({ section, dossier }: SectionContentProps) {
  switch (section) {
    case "completeness":
      return <CompletudeSection completeness={dossier.completeness} />
    case "score":
      return <ScoreSection score={dossier.score} />
    case "analysis":
      return <AnalyseSection analyse={dossier.analyse} />
    default:
      return <DossierOverview dossier={dossier} />
  }
}

function PlaceholderHeader() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-10 flex items-center gap-4 border-b bg-card/80 px-6 py-3 backdrop-blur-sm"
    >
      <Link
        to="/"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-sm text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[2px] focus-visible:ring-ring"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        File d'attente
      </Link>
    </header>
  )
}
