import type { DossierAggregate } from "../../api/types"
import { CompanyCard } from "./overview/CompanyCard"
import { DocumentsCard } from "./overview/DocumentsCard"
import { FinancingCard } from "./overview/FinancingCard"
import { ScoreCard } from "./overview/ScoreCard"

type DossierOverviewProps = {
  dossier: DossierAggregate
}

export function DossierOverview({ dossier }: DossierOverviewProps) {
  return (
    <section id="apercu" aria-label="Aperçu du dossier" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CompanyCard company={dossier.company} />
        <FinancingCard request={dossier.financingRequest} dossier={dossier} />
      </div>
      <ScoreCard score={dossier.score} />
      <DocumentsCard documents={dossier.documents} />
    </section>
  )
}
