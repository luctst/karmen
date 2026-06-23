import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@karmen/ui/components/card"

import type { Company } from "../../../api/types"
import { formatDate } from "../format"
import { Field } from "./Field"

type CompanyCardProps = {
  company: Company
}

export function CompanyCard({ company }: CompanyCardProps) {
  const address = [company.address, company.postalCode, company.countryCode]
    .filter(Boolean)
    .join(", ")

  const rows: Array<{ label: string; value: ReactNode; mono?: boolean }> = [
    { label: "SIREN", value: company.siren, mono: true },
    { label: "Forme juridique", value: company.legalCategory },
    { label: "Code NAF", value: company.codeNaf, mono: true },
    {
      label: "Date de création",
      value: company.creationDate ? formatDate(company.creationDate) : null,
      mono: true,
    },
    { label: "Adresse", value: address || null },
    { label: "Dirigeant", value: company.owner },
    { label: "Secteur", value: company.businessType },
  ]

  const visible = rows.filter((row) => row.value)

  return (
    <Card className="gap-3 py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Société</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <dl className="divide-y divide-border">
          {visible.map((row) => (
            <Field
              key={row.label}
              label={row.label}
              value={row.value}
              mono={row.mono}
            />
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
