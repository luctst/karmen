import type {
  Company,
  ConnectionSource,
  DossierAggregate,
  DossierAnalyse,
  DossierCompleteness,
  DossierDocument,
  DossierFinancingRequest,
  DossierScore,
  DossierScoreDetail,
  DossierStatus,
  DossierSummary,
  HiddenAccount,
  Indicator,
  RiskBucket,
  ScoreCheckItem,
  ScoreFactor,
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

export function makeScoreFactor(
  overrides: Partial<ScoreFactor> = {}
): ScoreFactor {
  seq += 1
  return {
    id: `f-${seq}`,
    label: `Facteur ${seq}`,
    direction: "up",
    weight: 60,
    ...overrides,
  }
}

export function makeScoreCheckItem(
  overrides: Partial<ScoreCheckItem> = {}
): ScoreCheckItem {
  seq += 1
  return {
    id: `ci-${seq}`,
    label: `À vérifier ${seq}`,
    ...overrides,
  }
}

export function makeScoreDetail(
  overrides: Partial<DossierScoreDetail> = {}
): DossierScoreDetail {
  seq += 1
  return {
    id: `s-${seq}`,
    ...makeScore(82, "low"),
    confidence: "high",
    confidenceReason: "Sources bancaires complètes.",
    calibrationNote: "Calibré sur 12 mois de relevés.",
    factors: [makeScoreFactor()],
    checkItems: [makeScoreCheckItem()],
    ...overrides,
  }
}

export function makeConnectionSource(
  overrides: Partial<ConnectionSource> = {}
): ConnectionSource {
  seq += 1
  return {
    id: `src-${seq}`,
    state: "connected",
    label: `Source ${seq}`,
    detail: null,
    ...overrides,
  }
}

export function makeHiddenAccount(
  overrides: Partial<HiddenAccount> = {}
): HiddenAccount {
  seq += 1
  return {
    id: `ha-${seq}`,
    ibanMasked: "FR76 **** **** 4242",
    pattern: "Virements récurrents non déclarés",
    ...overrides,
  }
}

export function makeCompleteness(
  overrides: Partial<DossierCompleteness> = {}
): DossierCompleteness {
  return {
    gateStatus: "complet",
    lastReminderAt: null,
    sources: [makeConnectionSource()],
    hiddenAccounts: [],
    ...overrides,
  }
}

export function makeIndicator(overrides: Partial<Indicator> = {}): Indicator {
  seq += 1
  return {
    id: `ind-${seq}`,
    label: `Indicateur ${seq}`,
    value: "1,2",
    threshold: null,
    status: "conforme",
    mitigants: [],
    ...overrides,
  }
}

export function makeAnalyse(
  overrides: Partial<DossierAnalyse> = {}
): DossierAnalyse {
  return {
    preAssessment: "Situation globalement saine.",
    indicators: [makeIndicator()],
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
    score: makeScoreDetail({ id: `s-${seq}` }),
    completeness: makeCompleteness(),
    analyse: makeAnalyse(),
    ...overrides,
  }
}
