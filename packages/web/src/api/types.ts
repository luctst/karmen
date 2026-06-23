// Hand-kept mirror of the API DTOs — keep in sync by inspection (no codegen yet).
export type DossierStatus =
  | "pending_review"
  | "info_requested"
  | "awaiting_client"
  | "approved"
  | "rejected"
  | "blocked"

export type RiskBucket = "low" | "medium" | "high"

export type FinancingType = "loan" | "line_of_credit" | "factoring" | "leasing"

export type Company = {
  id: string
  name: string
  siren: string
  businessType: string
}

export type DossierScore = {
  riskBucket: RiskBucket
  globalScore: number
}

// GET /dossiers
export type DossierSummary = {
  id: string
  company: Company
  type: FinancingType
  status: DossierStatus
  amount: number
  durationInMonth: number
  score: DossierScore | null
}

// GET /dossiers/:id (subset the Workspace stub consumes)
export type DossierDetail = {
  company: Company
  financingRequest: {
    id: string
    type: FinancingType
    status: DossierStatus
    amount: number
    durationInMonth: number
  }
  documents: Array<{ id: string; name: string; type: string }>
  score: DossierScore | null
}
