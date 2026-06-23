import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { useDossier } from "../api/hooks"

// STUB: proves row navigation only. Real shell (sidebar, sections, Valider) next.
export function Workspace() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useDossier(id)

  return (
    <div className="mx-auto min-w-[1024px] max-w-[1400px]">
      <header
        role="banner"
        className="flex items-center gap-3 border-b px-6 py-3"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[2px] focus-visible:ring-ring"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à la file
        </Link>
      </header>

      <main className="px-6 py-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement du dossier…</p>
        ) : error ? (
          <p className="text-sm text-status-block-foreground">
            Impossible de charger le dossier.
          </p>
        ) : data ? (
          <div className="space-y-2">
            <h1 className="text-xl font-semibold leading-tight text-foreground">
              {data.company.name}
            </h1>
            <p className="font-mono text-sm tabular-nums text-muted-foreground">
              SIREN {data.company.siren}
            </p>
            <p className="pt-4 text-sm text-muted-foreground">
              Espace dossier — à venir
            </p>
          </div>
        ) : null}
      </main>
    </div>
  )
}
