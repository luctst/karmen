export type DossierStatus =
  | "pending_review"
  | "info_requested"
  | "awaiting_client"
  | "approved"
  | "rejected"
  | "blocked"

export type RiskBucket = "low" | "medium" | "high"

export type FinancingType = "loan" | "line_of_credit" | "factoring" | "leasing"

export type DocumentType = "liasse_fiscale" | "releve_bancaire"

export type CompanySummary = {
  id: string
  name: string
  siren: string
  businessType: string | null
}

export type Company = {
  id: string
  name: string
  siren: string
  businessType: string | null
  legalCategory: string | null
  codeNaf: string | null
  creationDate: string | null
  address: string | null
  countryCode: string | null
  postalCode: string | null
  owner: string | null
}

export type DossierScore = {
  riskBucket: RiskBucket
  globalScore: number
}

export type DossierSummary = {
  id: string
  company: CompanySummary
  type: FinancingType
  status: DossierStatus
  amount: number
  durationInMonth: number
  score: DossierScore | null
}

export type DossierDocument = {
  id: string
  name: string
  type: DocumentType
  metadata: unknown
}

export type DossierFinancingRequest = {
  id: string
  type: FinancingType
  status: DossierStatus
  fundUsage: string | null
  rejectedReason: string | null
  amount: number
  durationInMonth: number
  interestRate: number | null
}

export type DossierAggregate = {
  company: Company
  financingRequest: DossierFinancingRequest
  documents: DossierDocument[]
  score: (DossierScore & { id: string }) | null
}
