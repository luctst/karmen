import type {
  Confidence,
  DocumentType,
  FactorDirection,
  FinancingType,
  GateStatus,
  IndicatorStatus,
  RequestStatus,
  RiskBucket,
  SourceState,
} from '@prisma/client';

export interface DossierQueueItem {
  id: string;
  company: {
    id: string;
    name: string;
    siren: string;
    businessType: string | null;
  };
  type: FinancingType;
  status: RequestStatus;
  amount: number;
  durationInMonth: number;
  score: {
    riskBucket: RiskBucket;
    globalScore: number;
  } | null;
}

export interface DossierCompany {
  id: string;
  name: string;
  siren: string;
  businessType: string | null;
  legalCategory: string | null;
  codeNaf: string | null;
  creationDate: Date | null;
  address: string | null;
  countryCode: string | null;
  postalCode: string | null;
  owner: string | null;
}

export interface DossierFinancingRequest {
  id: string;
  type: FinancingType;
  status: RequestStatus;
  fundUsage: string | null;
  rejectedReason: string | null;
  amount: number;
  durationInMonth: number;
  interestRate: number | null;
}

export interface DossierDocument {
  id: string;
  name: string;
  type: DocumentType;
  metadata: unknown;
}

export interface DossierScoreFactor {
  id: string;
  label: string;
  direction: FactorDirection;
  weight: number;
}

export interface DossierCheckItem {
  id: string;
  label: string;
}

export interface DossierScore {
  id: string;
  riskBucket: RiskBucket;
  globalScore: number;
  confidence: Confidence;
  confidenceReason: string | null;
  calibrationNote: string | null;
  factors: DossierScoreFactor[];
  checkItems: DossierCheckItem[];
}

export interface DossierConnectionSource {
  id: string;
  state: SourceState;
  label: string;
  detail: string | null;
}

export interface DossierHiddenAccount {
  id: string;
  ibanMasked: string;
  pattern: string;
}

export interface DossierCompleteness {
  gateStatus: GateStatus;
  lastReminderAt: Date | null;
  sources: DossierConnectionSource[];
  hiddenAccounts: DossierHiddenAccount[];
}

export interface DossierMitigant {
  id: string;
  text: string;
}

export interface DossierIndicator {
  id: string;
  label: string;
  value: string;
  threshold: string | null;
  status: IndicatorStatus;
  mitigants: DossierMitigant[];
}

export interface DossierAnalyse {
  preAssessment: string;
  indicators: DossierIndicator[];
}

export interface DossierAggregate {
  company: DossierCompany;
  financingRequest: DossierFinancingRequest;
  documents: DossierDocument[];
  score: DossierScore | null;
  completeness: DossierCompleteness | null;
  analyse: DossierAnalyse | null;
}

export type DossierDecision = 'approve' | 'reject' | 'request_info';
