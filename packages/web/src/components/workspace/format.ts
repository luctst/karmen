import type { DocumentType, FinancingType } from "../../api/types"

const EUR = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const DATE = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

const FINANCING_TYPE_LABELS: Record<FinancingType, string> = {
  loan: "Prêt",
  line_of_credit: "Ligne de crédit",
  factoring: "Affacturage",
  leasing: "Crédit-bail",
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  liasse_fiscale: "Liasse fiscale",
  releve_bancaire: "Relevé bancaire",
}

export function formatEuros(amount: number): string {
  return EUR.format(amount)
}

export function formatDuration(months: number): string {
  return `${months} mois`
}

export function formatRate(rate: number): string {
  return `${rate.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return DATE.format(date)
}

export function financingTypeLabel(type: FinancingType): string {
  return FINANCING_TYPE_LABELS[type]
}

export function documentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_LABELS[type]
}

export function documentMetaLabel(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null
  const meta = metadata as Record<string, unknown>

  const year = meta.year ?? meta.exercice
  if (typeof year === "number" || typeof year === "string") {
    return `Exercice ${year}`
  }

  const parts: string[] = []
  if (typeof meta.bank === "string") parts.push(meta.bank)
  if (typeof meta.account === "string") parts.push(meta.account)
  if (typeof meta.months === "number") parts.push(`${meta.months} mois`)

  return parts.length > 0 ? parts.join(" · ") : null
}
