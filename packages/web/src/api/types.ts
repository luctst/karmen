/**
 * Hand-kept mirror of the Karmen API DTOs. This is the contract the web app
 * codes against; keep it in sync with the API by inspection (no codegen yet).
 */

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

/** Shape of one item from `GET /dossiers`. */
export type DossierSummary = {
  id: string
  company: Company
  type: FinancingType
  status: DossierStatus
  amount: number
  durationInMonth: number
  score: DossierScore | null
}

/** Subset of `GET /dossiers/:id` the Workspace stub consumes. */
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
