import { FileText } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@karmen/ui/components/card"

import type { DossierDocument } from "../../../api/types"
import { EmptyState } from "../../EmptyState"
import { documentMetaLabel, documentTypeLabel } from "../format"

type DocumentsCardProps = {
  documents: DossierDocument[]
}

export function DocumentsCard({ documents }: DocumentsCardProps) {
  return (
    <Card className="gap-3 py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Pièces justificatives</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucune pièce."
            description="Aucun document n'est rattaché à ce dossier."
          />
        ) : (
          <ul className="divide-y divide-border">
            {documents.map((document) => (
              <DocumentRow key={document.id} document={document} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

type DocumentRowProps = {
  document: DossierDocument
}

function DocumentRow({ document }: DocumentRowProps) {
  const meta = documentMetaLabel(document.metadata)

  return (
    <li className="flex items-center gap-3 py-2">
      <FileText
        size={16}
        aria-hidden="true"
        className="shrink-0 text-muted-foreground"
      />
      <span
        className="min-w-0 flex-1 truncate text-sm text-foreground"
        title={document.name}
      >
        {document.name}
      </span>
      {meta ? (
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {meta}
        </span>
      ) : null}
      <span className="shrink-0 rounded-sm border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {documentTypeLabel(document.type)}
      </span>
    </li>
  )
}
