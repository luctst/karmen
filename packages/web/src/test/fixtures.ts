import type {
  DossierScore,
  DossierStatus,
  DossierSummary,
  RiskBucket,
} from "../api/types"

// makeDossier builds a valid summary; override only the fields a test cares about.
let seq = 0

export function makeScore(
  globalScore: number,
  riskBucket: RiskBucket = "low"
): DossierScore {
  return { globalScore, riskBucket }
}

export function makeDossier(
  overrides: Partial<DossierSummary> = {}
): DossierSummary {
  seq += 1
  const id = overrides.id ?? `d-${seq}`
  return {
    id,
    company: {
      id: `c-${seq}`,
      name: `Société ${seq}`,
      siren: "123456789",
      businessType: "SAS",
      ...overrides.company,
    },
    type: "loan",
    status: "pending_review" as DossierStatus,
    amount: 50000,
    durationInMonth: 24,
    score: makeScore(72, "low"),
    ...overrides,
  }
}
