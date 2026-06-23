import {
  DocumentType,
  FinancingType,
  PrismaClient,
  RequestStatus,
  RiskBucket,
} from '@prisma/client';

const prisma = new PrismaClient();

interface SeedDocument {
  id: string;
  name: string;
  type: DocumentType;
  metadata: Record<string, unknown>;
}

interface SeedDossier {
  company: {
    id: string;
    name: string;
    siren: string;
    businessType: string;
    legalCategory: string;
    codeNaf: string;
    creationDate: string;
    address: string;
    countryCode: string;
    postalCode: string;
    owner: string;
  };
  financingRequest: {
    id: string;
    type: FinancingType;
    status: RequestStatus;
    fundUsage: string;
    rejectedReason: string | null;
    amount: number;
    durationInMonth: number;
    interestRate: number | null;
  };
  documents: SeedDocument[];
  score: { id: string; riskBucket: RiskBucket; globalScore: number } | null;
}

const dossiers: SeedDossier[] = [
  {
    company: {
      id: 'c-003',
      name: 'Transport Leclerc Express',
      siren: '756789012',
      businessType: 'Transport routier',
      legalCategory: 'SA',
      codeNaf: '4941A',
      creationDate: '2015-06-20',
      address: 'ZI Les Platanes, Creil',
      countryCode: 'FR',
      postalCode: '60100',
      owner: 'Jean-Marc Leclerc',
    },
    financingRequest: {
      id: 'fr-003',
      type: FinancingType.loan,
      status: RequestStatus.pending_review,
      fundUsage: 'Renouvellement flotte véhicules',
      rejectedReason: null,
      amount: 75000,
      durationInMonth: 18,
      interestRate: 7.8,
    },
    documents: [
      {
        id: 'd-006',
        name: 'Liasse fiscale 2023',
        type: DocumentType.liasse_fiscale,
        metadata: { year: 2023 },
      },
      {
        id: 'd-007',
        name: 'Liasse fiscale 2024',
        type: DocumentType.liasse_fiscale,
        metadata: { year: 2024 },
      },
      {
        id: 'd-008',
        name: 'Relevés SG janv-déc 2024',
        type: DocumentType.releve_bancaire,
        metadata: {
          bank: 'Société Générale',
          account: 'FR7620041000001',
          months_covered: 12,
        },
      },
      {
        id: 'd-009',
        name: 'Relevés BNP janv-déc 2024',
        type: DocumentType.releve_bancaire,
        metadata: {
          bank: 'BNP Paribas',
          account: 'FR7630004000002',
          months_covered: 12,
        },
      },
    ],
    score: { id: 's-003', riskBucket: RiskBucket.high, globalScore: 34 },
  },

  {
    company: {
      id: 'c-001',
      name: 'Boulangerie Martin SARL',
      siren: '512345678',
      businessType: 'Boulangerie-pâtisserie',
      legalCategory: 'SARL',
      codeNaf: '1071C',
      creationDate: '2012-03-14',
      address: '12 rue du Four, Lyon',
      countryCode: 'FR',
      postalCode: '69003',
      owner: 'Sophie Martin',
    },
    financingRequest: {
      id: 'fr-001',
      type: FinancingType.loan,
      status: RequestStatus.pending_review,
      fundUsage: 'Achat nouveau four',
      rejectedReason: null,
      amount: 40000,
      durationInMonth: 24,
      interestRate: 4.2,
    },
    documents: [
      {
        id: 'd-001',
        name: 'Liasse fiscale 2024',
        type: DocumentType.liasse_fiscale,
        metadata: { year: 2024 },
      },
      {
        id: 'd-002',
        name: 'Relevés CA janv-déc 2024',
        type: DocumentType.releve_bancaire,
        metadata: {
          bank: 'Crédit Agricole',
          account: 'FR7611111000003',
          months_covered: 12,
        },
      },
    ],
    score: { id: 's-001', riskBucket: RiskBucket.low, globalScore: 82 },
  },

  {
    company: {
      id: 'c-002',
      name: 'Construction Léon SA',
      siren: '623456789',
      businessType: 'Travaux de construction',
      legalCategory: 'SA',
      codeNaf: '4120A',
      creationDate: '2008-11-02',
      address: '5 avenue des Bâtisseurs, Nantes',
      countryCode: 'FR',
      postalCode: '44000',
      owner: 'Léon Girard',
    },
    financingRequest: {
      id: 'fr-002',
      type: FinancingType.line_of_credit,
      status: RequestStatus.awaiting_client,
      fundUsage: 'Besoin de trésorerie chantier',
      rejectedReason: null,
      amount: 120000,
      durationInMonth: 12,
      interestRate: null,
    },
    documents: [],
    score: null,
  },

  {
    company: {
      id: 'c-004',
      name: 'Garage Dupont EURL',
      siren: '812345678',
      businessType: 'Entretien et réparation de véhicules',
      legalCategory: 'EURL',
      codeNaf: '4520A',
      creationDate: '2018-09-10',
      address: '88 route de Paris, Tours',
      countryCode: 'FR',
      postalCode: '37000',
      owner: 'Patrick Dupont',
    },
    financingRequest: {
      id: 'fr-004',
      type: FinancingType.leasing,
      status: RequestStatus.pending_review,
      fundUsage: 'Équipement atelier (pont élévateur)',
      rejectedReason: null,
      amount: 35000,
      durationInMonth: 36,
      interestRate: 6.1,
    },
    documents: [
      {
        id: 'd-010',
        name: 'Liasse fiscale 2024',
        type: DocumentType.liasse_fiscale,
        metadata: { year: 2024 },
      },
    ],
    score: { id: 's-004', riskBucket: RiskBucket.medium, globalScore: 58 },
  },
];

async function seedDossier(dossier: SeedDossier): Promise<void> {
  const { company, financingRequest, documents, score } = dossier;

  await prisma.company.upsert({
    where: { id: company.id },
    update: {
      ...company,
      creationDate: new Date(company.creationDate),
    },
    create: {
      ...company,
      creationDate: new Date(company.creationDate),
    },
  });

  await prisma.financingRequest.upsert({
    where: { id: financingRequest.id },
    update: { ...financingRequest, companyId: company.id },
    create: { ...financingRequest, companyId: company.id },
  });

  for (const document of documents) {
    await prisma.document.upsert({
      where: { id: document.id },
      update: {
        name: document.name,
        type: document.type,
        metadata: document.metadata,
        companyId: company.id,
        financingRequestId: financingRequest.id,
      },
      create: {
        id: document.id,
        name: document.name,
        type: document.type,
        metadata: document.metadata,
        companyId: company.id,
        financingRequestId: financingRequest.id,
      },
    });
  }

  if (score !== null) {
    await prisma.score.upsert({
      where: { id: score.id },
      update: {
        riskBucket: score.riskBucket,
        globalScore: score.globalScore,
        financingRequestId: financingRequest.id,
      },
      create: {
        id: score.id,
        riskBucket: score.riskBucket,
        globalScore: score.globalScore,
        financingRequestId: financingRequest.id,
      },
    });
  }
}

async function main(): Promise<void> {
  for (const dossier of dossiers) {
    await seedDossier(dossier);
  }
  // eslint-disable-next-line no-console
  console.log(`[seed] upserted ${dossiers.length} dossiers`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err: unknown) => {
    // eslint-disable-next-line no-console
    console.error('[seed] failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
