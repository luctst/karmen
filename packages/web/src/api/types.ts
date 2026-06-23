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

export type Confidence = "high" | "medium" | "low"

export type FactorDirection = "up" | "down"

export type IndicatorStatus = "conforme" | "notable" | "blocking" | "info"

export type GateStatus = "complet" | "action_requise" | "attente_client"

export type SourceState = "connected" | "pending" | "failed" | "fallback"

export type ScoreFactor = {
  id: string
  label: string
  direction: FactorDirection
  weight: number
}

export type ScoreCheckItem = {
  id: string
  label: string
}

export type DossierScoreDetail = DossierScore & {
  id: string
  confidence: Confidence
  confidenceReason: string | null
  calibrationNote: string | null
  factors: ScoreFactor[]
  checkItems: ScoreCheckItem[]
}

export type ConnectionSource = {
  id: string
  state: SourceState
  label: string
  detail: string | null
}

export type HiddenAccount = {
  id: string
  ibanMasked: string
  pattern: string
}

export type DossierCompleteness = {
  gateStatus: GateStatus
  lastReminderAt: string | null
  sources: ConnectionSource[]
  hiddenAccounts: HiddenAccount[]
}

export type Mitigant = {
  id: string
  text: string
}

export type Indicator = {
  id: string
  label: string
  value: string
  threshold: string | null
  status: IndicatorStatus
  mitigants: Mitigant[]
}

export type DossierAnalyse = {
  preAssessment: string
  indicators: Indicator[]
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
  score: DossierScoreDetail | null
  completeness: DossierCompleteness | null
  analyse: DossierAnalyse | null
}

export type DecisionKind = "approve" | "reject" | "request_info"

export type DecisionPayload = {
  decision: DecisionKind
  reason?: string
}
