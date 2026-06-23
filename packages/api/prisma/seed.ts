import {
  Confidence,
  DocumentType,
  FactorDirection,
  FinancingType,
  GateStatus,
  IndicatorStatus,
  PrismaClient,
  RequestStatus,
  RiskBucket,
  SourceKind,
  SourceState,
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
  score: SeedScore | null;
  completeness: SeedCompleteness | null;
  sources: SeedSource[];
  hiddenAccounts: SeedHiddenAccount[];
  analyse: SeedAnalyse | null;
}

interface SeedScore {
  id: string;
  riskBucket: RiskBucket;
  globalScore: number;
  confidence: Confidence;
  confidenceReason: string | null;
  calibrationNote: string | null;
  factors: SeedFactor[];
  checkItems: SeedCheckItem[];
}

interface SeedFactor {
  id: string;
  label: string;
  direction: FactorDirection;
  weight: number;
}

interface SeedCheckItem {
  id: string;
  label: string;
}

interface SeedCompleteness {
  id: string;
  gateStatus: GateStatus;
  lastReminderAt: string | null;
}

interface SeedSource {
  id: string;
  kind: SourceKind;
  state: SourceState;
  label: string;
  detail: string | null;
}

interface SeedHiddenAccount {
  id: string;
  ibanMasked: string;
  pattern: string;
}

interface SeedAnalyse {
  id: string;
  preAssessment: string;
  indicators: SeedIndicator[];
}

interface SeedIndicator {
  id: string;
  label: string;
  category: string | null;
  value: string;
  threshold: string | null;
  status: IndicatorStatus;
  evidenceLabel: string | null;
  mitigants: SeedMitigant[];
}

interface SeedMitigant {
  id: string;
  text: string;
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
    score: {
      id: 's-003',
      riskBucket: RiskBucket.high,
      globalScore: 34,
      confidence: Confidence.medium,
      confidenceReason: 'Historique de 10 mois sur un compte, < 12 requis',
      calibrationNote:
        'Sur 142 dossiers similaires, ce score a bien prédit dans 89% des cas.',
      factors: [
        {
          id: 'sf-003-1',
          label: 'Trésorerie en baisse',
          direction: FactorDirection.down,
          weight: 80,
        },
        {
          id: 'sf-003-2',
          label: 'Endettement élevé',
          direction: FactorDirection.down,
          weight: 70,
        },
        {
          id: 'sf-003-3',
          label: 'Rentabilité stable',
          direction: FactorDirection.up,
          weight: 50,
        },
        {
          id: 'sf-003-4',
          label: 'Ancienneté 9 ans',
          direction: FactorDirection.up,
          weight: 30,
        },
      ],
      checkItems: [
        {
          id: 'ci-003-1',
          label: "Confirmer l'origine de la baisse de trésorerie",
        },
        {
          id: 'ci-003-2',
          label: "Vérifier le ratio d'endettement post-emprunt",
        },
      ],
    },
    completeness: {
      id: 'cp-003',
      gateStatus: GateStatus.complet,
      lastReminderAt: null,
    },
    sources: [
      {
        id: 'cs-003-1',
        kind: SourceKind.bank,
        state: SourceState.connected,
        label: 'Banque (DSP2)',
        detail: '2/2 comptes · 12 mois/compte',
      },
      {
        id: 'cs-003-2',
        kind: SourceKind.fiscal,
        state: SourceState.connected,
        label: 'Données fiscales',
        detail: '2 liasses · 2023, 2024',
      },
    ],
    hiddenAccounts: [
      {
        id: 'ha-003-1',
        ibanMasked: 'FR76•••4821',
        pattern: 'Virements récurrents vers un compte du même titulaire',
      },
    ],
    analyse: {
      id: 'an-003',
      preAssessment:
        "L'entreprise présente une rentabilité stable mais une trésorerie en tension sur les 3 derniers mois. L'endettement dépasse le seuil de politique, partiellement compensé par un carnet de commandes solide.",
      indicators: [
        {
          id: 'in-003-1',
          label: "Ratio d'endettement",
          category: 'Solvabilité',
          value: '2.8',
          threshold: '≤ 2.0',
          status: IndicatorStatus.blocking,
          evidenceLabel: 'liasse 2024 p.4',
          mitigants: [
            {
              id: 'mi-003-1',
              text: 'Carnet de commandes 14 mois (couvre la dette court terme)',
            },
          ],
        },
        {
          id: 'in-003-2',
          label: 'Trésorerie / CA',
          category: 'Liquidité',
          value: '4%',
          threshold: '≥ 8%',
          status: IndicatorStatus.notable,
          evidenceLabel: 'relevés Q1',
          mitigants: [],
        },
        {
          id: 'in-003-3',
          label: 'Marge brute',
          category: 'Rentabilité',
          value: '32%',
          threshold: '≥ 25%',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'liasse 2024 p.2',
          mitigants: [],
        },
        {
          id: 'in-003-4',
          label: "Chiffre d'affaires N/N-1",
          category: 'Activité',
          value: '+6%',
          threshold: '≥ 0%',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'liasse 2024 p.1',
          mitigants: [],
        },
        {
          id: 'in-003-5',
          label: 'Capacité de remboursement',
          category: 'Solvabilité',
          value: '2.1x',
          threshold: '≥ 1.5x',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'liasse 2024 p.3',
          mitigants: [],
        },
        {
          id: 'in-003-6',
          label: 'Délai moyen de paiement clients',
          category: 'BFR',
          value: '52 j',
          threshold: '≤ 60 j',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'relevés 2024',
          mitigants: [],
        },
      ],
    },
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
    score: {
      id: 's-001',
      riskBucket: RiskBucket.low,
      globalScore: 82,
      confidence: Confidence.high,
      confidenceReason: '12 mois de relevés, calibration dense, facteurs alignés',
      calibrationNote:
        'Sur 210 dossiers similaires, ce score a bien prédit dans 94% des cas.',
      factors: [
        {
          id: 'sf-001-1',
          label: 'Trésorerie en hausse',
          direction: FactorDirection.up,
          weight: 75,
        },
        {
          id: 'sf-001-2',
          label: 'Rentabilité solide',
          direction: FactorDirection.up,
          weight: 65,
        },
        {
          id: 'sf-001-3',
          label: 'Endettement maîtrisé',
          direction: FactorDirection.up,
          weight: 55,
        },
      ],
      checkItems: [],
    },
    completeness: {
      id: 'cp-001',
      gateStatus: GateStatus.complet,
      lastReminderAt: null,
    },
    sources: [
      {
        id: 'cs-001-1',
        kind: SourceKind.bank,
        state: SourceState.connected,
        label: 'Banque (DSP2)',
        detail: '1/1 compte · 12 mois/compte',
      },
      {
        id: 'cs-001-2',
        kind: SourceKind.fiscal,
        state: SourceState.connected,
        label: 'Données fiscales',
        detail: '1 liasse · 2024',
      },
    ],
    hiddenAccounts: [],
    analyse: {
      id: 'an-001',
      preAssessment:
        "Dossier conforme, aucune anomalie. L'entreprise affiche une trésorerie en hausse, une rentabilité solide et un endettement maîtrisé. Tous les indicateurs sont dans les seuils de politique.",
      indicators: [
        {
          id: 'in-001-1',
          label: "Ratio d'endettement",
          category: 'Solvabilité',
          value: '0.9',
          threshold: '≤ 2.0',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'liasse 2024 p.4',
          mitigants: [],
        },
        {
          id: 'in-001-2',
          label: 'Trésorerie / CA',
          category: 'Liquidité',
          value: '14%',
          threshold: '≥ 8%',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'relevés 2024',
          mitigants: [],
        },
        {
          id: 'in-001-3',
          label: 'Marge brute',
          category: 'Rentabilité',
          value: '41%',
          threshold: '≥ 25%',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'liasse 2024 p.2',
          mitigants: [],
        },
        {
          id: 'in-001-4',
          label: 'Capacité de remboursement',
          category: 'Solvabilité',
          value: '3.4x',
          threshold: '≥ 1.5x',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'liasse 2024 p.3',
          mitigants: [],
        },
      ],
    },
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
    completeness: {
      id: 'cp-002',
      gateStatus: GateStatus.attente_client,
      lastReminderAt: '2026-06-20T09:00:00.000Z',
    },
    sources: [
      {
        id: 'cs-002-1',
        kind: SourceKind.bank,
        state: SourceState.pending,
        label: 'Banque (DSP2)',
        detail: 'En attente de connexion client',
      },
      {
        id: 'cs-002-2',
        kind: SourceKind.fiscal,
        state: SourceState.failed,
        label: 'Données fiscales',
        detail: 'Connexion échouée — relance envoyée',
      },
    ],
    hiddenAccounts: [],
    analyse: null,
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
    score: {
      id: 's-004',
      riskBucket: RiskBucket.medium,
      globalScore: 58,
      confidence: Confidence.medium,
      confidenceReason: 'Une seule liasse disponible, calibration partielle',
      calibrationNote:
        'Sur 98 dossiers similaires, ce score a bien prédit dans 86% des cas.',
      factors: [
        {
          id: 'sf-004-1',
          label: 'Marge en repli',
          direction: FactorDirection.down,
          weight: 60,
        },
        {
          id: 'sf-004-2',
          label: 'Trésorerie correcte',
          direction: FactorDirection.up,
          weight: 45,
        },
        {
          id: 'sf-004-3',
          label: 'Ancienneté 8 ans',
          direction: FactorDirection.up,
          weight: 35,
        },
      ],
      checkItems: [
        {
          id: 'ci-004-1',
          label: 'Confirmer la cause du repli de marge',
        },
      ],
    },
    completeness: {
      id: 'cp-004',
      gateStatus: GateStatus.complet,
      lastReminderAt: null,
    },
    sources: [
      {
        id: 'cs-004-1',
        kind: SourceKind.bank,
        state: SourceState.connected,
        label: 'Banque (DSP2)',
        detail: '1/1 compte · 12 mois/compte',
      },
      {
        id: 'cs-004-2',
        kind: SourceKind.fiscal,
        state: SourceState.connected,
        label: 'Données fiscales',
        detail: '1 liasse · 2024',
      },
    ],
    hiddenAccounts: [],
    analyse: {
      id: 'an-004',
      preAssessment:
        "L'entreprise reste solvable mais sa marge brute recule sous le seuil de politique. La trésorerie et la capacité de remboursement demeurent satisfaisantes.",
      indicators: [
        {
          id: 'in-004-1',
          label: 'Marge brute',
          category: 'Rentabilité',
          value: '22%',
          threshold: '≥ 25%',
          status: IndicatorStatus.notable,
          evidenceLabel: 'liasse 2024 p.2',
          mitigants: [],
        },
        {
          id: 'in-004-2',
          label: "Ratio d'endettement",
          category: 'Solvabilité',
          value: '1.4',
          threshold: '≤ 2.0',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'liasse 2024 p.4',
          mitigants: [],
        },
        {
          id: 'in-004-3',
          label: 'Trésorerie / CA',
          category: 'Liquidité',
          value: '9%',
          threshold: '≥ 8%',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'relevés 2024',
          mitigants: [],
        },
        {
          id: 'in-004-4',
          label: 'Capacité de remboursement',
          category: 'Solvabilité',
          value: '1.8x',
          threshold: '≥ 1.5x',
          status: IndicatorStatus.conforme,
          evidenceLabel: 'liasse 2024 p.3',
          mitigants: [],
        },
      ],
    },
  },
];

async function seedDossier(dossier: SeedDossier): Promise<void> {
  const {
    company,
    financingRequest,
    documents,
    score,
    completeness,
    sources,
    hiddenAccounts,
    analyse,
  } = dossier;

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
    const scoreData = {
      riskBucket: score.riskBucket,
      globalScore: score.globalScore,
      confidence: score.confidence,
      confidenceReason: score.confidenceReason,
      calibrationNote: score.calibrationNote,
      financingRequestId: financingRequest.id,
    };

    await prisma.score.upsert({
      where: { id: score.id },
      update: scoreData,
      create: { id: score.id, ...scoreData },
    });

    await prisma.scoreFactor.deleteMany({ where: { scoreId: score.id } });
    for (const factor of score.factors) {
      await prisma.scoreFactor.create({
        data: {
          id: factor.id,
          scoreId: score.id,
          label: factor.label,
          direction: factor.direction,
          weight: factor.weight,
        },
      });
    }

    await prisma.checkItem.deleteMany({ where: { scoreId: score.id } });
    for (const checkItem of score.checkItems) {
      await prisma.checkItem.create({
        data: {
          id: checkItem.id,
          scoreId: score.id,
          label: checkItem.label,
        },
      });
    }
  }

  if (completeness !== null) {
    const completenessData = {
      gateStatus: completeness.gateStatus,
      lastReminderAt:
        completeness.lastReminderAt === null
          ? null
          : new Date(completeness.lastReminderAt),
      financingRequestId: financingRequest.id,
    };

    await prisma.completeness.upsert({
      where: { id: completeness.id },
      update: completenessData,
      create: { id: completeness.id, ...completenessData },
    });
  }

  await prisma.connectionSource.deleteMany({
    where: { financingRequestId: financingRequest.id },
  });
  for (const source of sources) {
    await prisma.connectionSource.create({
      data: {
        id: source.id,
        financingRequestId: financingRequest.id,
        kind: source.kind,
        state: source.state,
        label: source.label,
        detail: source.detail,
      },
    });
  }

  await prisma.hiddenAccount.deleteMany({
    where: { financingRequestId: financingRequest.id },
  });
  for (const hiddenAccount of hiddenAccounts) {
    await prisma.hiddenAccount.create({
      data: {
        id: hiddenAccount.id,
        financingRequestId: financingRequest.id,
        ibanMasked: hiddenAccount.ibanMasked,
        pattern: hiddenAccount.pattern,
      },
    });
  }

  if (analyse !== null) {
    await prisma.analyse.upsert({
      where: { id: analyse.id },
      update: {
        preAssessment: analyse.preAssessment,
        financingRequestId: financingRequest.id,
      },
      create: {
        id: analyse.id,
        preAssessment: analyse.preAssessment,
        financingRequestId: financingRequest.id,
      },
    });

    await prisma.indicator.deleteMany({ where: { analyseId: analyse.id } });
    for (const indicator of analyse.indicators) {
      await prisma.indicator.create({
        data: {
          id: indicator.id,
          analyseId: analyse.id,
          label: indicator.label,
          category: indicator.category,
          value: indicator.value,
          threshold: indicator.threshold,
          status: indicator.status,
          evidenceLabel: indicator.evidenceLabel,
          mitigants: {
            create: indicator.mitigants.map((mitigant) => ({
              id: mitigant.id,
              text: mitigant.text,
            })),
          },
        },
      });
    }
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
