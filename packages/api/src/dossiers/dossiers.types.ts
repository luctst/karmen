import type {
  DocumentType,
  FinancingType,
  RequestStatus,
  RiskBucket,
} from '@prisma/client';

/** A queue row: a FinancingRequest joined to its company + score. */
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

export interface DossierScore {
  id: string;
  riskBucket: RiskBucket;
  globalScore: number;
}

/** The full aggregate returned by GET /dossiers/:id. */
export interface DossierAggregate {
  company: DossierCompany;
  financingRequest: DossierFinancingRequest;
  documents: DossierDocument[];
  score: DossierScore | null;
}
