import type {
  Company,
  DossierAggregate,
  DossierDocument,
  DossierFinancingRequest,
  DossierScore,
  DossierStatus,
  DossierSummary,
  RiskBucket,
} from "../api/types"

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

export function makeCompany(overrides: Partial<Company> = {}): Company {
  seq += 1
  return {
    id: `c-${seq}`,
    name: `Société ${seq}`,
    siren: "123456789",
    businessType: "Conseil",
    legalCategory: "SAS",
    codeNaf: "62.01Z",
    creationDate: "2018-03-15",
    address: "12 rue de la Paix",
    countryCode: "FR",
    postalCode: "75002",
    owner: "Jeanne Martin",
    ...overrides,
  }
}

export function makeFinancingRequest(
  overrides: Partial<DossierFinancingRequest> = {}
): DossierFinancingRequest {
  seq += 1
  return {
    id: `fr-${seq}`,
    type: "loan",
    status: "pending_review" as DossierStatus,
    fundUsage: "Trésorerie",
    rejectedReason: null,
    amount: 50000,
    durationInMonth: 24,
    interestRate: 4.5,
    ...overrides,
  }
}

export function makeDocument(
  overrides: Partial<DossierDocument> = {}
): DossierDocument {
  seq += 1
  return {
    id: `doc-${seq}`,
    name: `document-${seq}.pdf`,
    type: "liasse_fiscale",
    metadata: { year: 2023 },
    ...overrides,
  }
}

export function makeAggregate(
  overrides: Partial<DossierAggregate> = {}
): DossierAggregate {
  seq += 1
  return {
    company: makeCompany(),
    financingRequest: makeFinancingRequest(),
    documents: [makeDocument()],
    score: { id: `s-${seq}`, ...makeScore(82, "low") },
    ...overrides,
  }
}
