import { NotFoundException } from '@nestjs/common';

import type { PrismaService } from '../prisma/prisma.service';
import { DossiersService } from './dossiers.service';

interface PrismaMock {
  financingRequest: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
}

function createPrismaMock(): PrismaMock {
  return {
    financingRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
}

function asPrismaService(mock: PrismaMock): PrismaService {
  return mock as unknown as PrismaService;
}

describe('DossiersService', () => {
  describe('listDossiers mapping', () => {
    it('maps a record with a score into a queue item', async () => {
      const prisma = createPrismaMock();
      prisma.financingRequest.findMany.mockResolvedValue([
        {
          id: 'fr-003',
          type: 'loan',
          status: 'pending_review',
          amount: 75000,
          durationInMonth: 18,
          company: {
            id: 'c-003',
            name: 'Transport Leclerc Express',
            siren: '756789012',
            businessType: 'Transport routier',
          },
          score: { riskBucket: 'high', globalScore: 34 },
        },
      ]);

      const service = new DossiersService(asPrismaService(prisma));
      const result = await service.listDossiers();

      expect(result).toEqual([
        {
          id: 'fr-003',
          type: 'loan',
          status: 'pending_review',
          amount: 75000,
          durationInMonth: 18,
          company: {
            id: 'c-003',
            name: 'Transport Leclerc Express',
            siren: '756789012',
            businessType: 'Transport routier',
          },
          score: { riskBucket: 'high', globalScore: 34 },
        },
      ]);
    });

    it('maps a scoreless record to score: null', async () => {
      const prisma = createPrismaMock();
      prisma.financingRequest.findMany.mockResolvedValue([
        {
          id: 'fr-004',
          type: 'line_of_credit',
          status: 'awaiting_client',
          amount: 20000,
          durationInMonth: 12,
          company: {
            id: 'c-004',
            name: 'Construction Léon SA',
            siren: '999000111',
            businessType: null,
          },
          score: null,
        },
      ]);

      const service = new DossiersService(asPrismaService(prisma));
      const [item] = await service.listDossiers();

      expect(item.score).toBeNull();
      expect(item.company.businessType).toBeNull();
    });
  });

  describe('getDossier', () => {
    it('throws NotFoundException when the id is unknown', async () => {
      const prisma = createPrismaMock();
      prisma.financingRequest.findUnique.mockResolvedValue(null);

      const service = new DossiersService(asPrismaService(prisma));

      await expect(service.getDossier('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('maps the full enriched aggregate', async () => {
      const prisma = createPrismaMock();
      prisma.financingRequest.findUnique.mockResolvedValue(
        enrichedRecord('fr-003'),
      );

      const service = new DossiersService(asPrismaService(prisma));
      const result = await service.getDossier('fr-003');

      expect(result.company.owner).toBe('Jean-Marc Leclerc');
      expect(result.financingRequest.interestRate).toBe(7.8);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].metadata).toEqual({ year: 2023 });
      expect(result.financingRequest).not.toHaveProperty('companyId');

      expect(result.score).toEqual({
        id: 's-003',
        riskBucket: 'high',
        globalScore: 34,
        confidence: 'medium',
        confidenceReason: 'Historique court',
        calibrationNote: 'Calibré sur 142 cas',
        factors: [
          { id: 'sf-1', label: 'Trésorerie en baisse', direction: 'down', weight: 80 },
        ],
        checkItems: [{ id: 'ci-1', label: 'Vérifier la trésorerie' }],
      });

      expect(result.completeness).toEqual({
        gateStatus: 'complet',
        lastReminderAt: null,
        sources: [
          {
            id: 'cs-1',
            state: 'connected',
            label: 'Banque (DSP2)',
            detail: '2/2 comptes',
          },
        ],
        hiddenAccounts: [
          { id: 'ha-1', ibanMasked: 'FR76•••4821', pattern: 'Virements récurrents' },
        ],
      });

      expect(result.analyse).toEqual({
        preAssessment: 'Trésorerie en tension.',
        indicators: [
          {
            id: 'in-1',
            label: "Ratio d'endettement",
            value: '2.8',
            threshold: '≤ 2.0',
            status: 'blocking',
            mitigants: [{ id: 'mi-1', text: 'Carnet de commandes 14 mois' }],
          },
        ],
      });
    });

    it('maps null score, completeness and analyse', async () => {
      const prisma = createPrismaMock();
      const record = enrichedRecord('fr-002');
      record.score = null;
      record.completeness = null;
      record.connectionSources = [];
      record.hiddenAccounts = [];
      record.analyse = null;
      prisma.financingRequest.findUnique.mockResolvedValue(record);

      const service = new DossiersService(asPrismaService(prisma));
      const result = await service.getDossier('fr-002');

      expect(result.score).toBeNull();
      expect(result.completeness).toBeNull();
      expect(result.analyse).toBeNull();
    });
  });

  describe('decideDossier', () => {
    it('throws NotFoundException for an unknown id', async () => {
      const prisma = createPrismaMock();
      prisma.financingRequest.findUnique.mockResolvedValue(null);

      const service = new DossiersService(asPrismaService(prisma));

      await expect(
        service.decideDossier('missing', { decision: 'approve' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.financingRequest.update).not.toHaveBeenCalled();
    });

    it('approves: sets status approved and clears rejectedReason', async () => {
      const prisma = createPrismaMock();
      prisma.financingRequest.findUnique.mockResolvedValue({ id: 'fr-003' });
      prisma.financingRequest.update.mockResolvedValue(enrichedRecord('fr-003'));

      const service = new DossiersService(asPrismaService(prisma));
      await service.decideDossier('fr-003', { decision: 'approve' });

      expect(prisma.financingRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'fr-003' },
          data: { status: 'approved', rejectedReason: null },
        }),
      );
    });

    it('rejects: sets status rejected and stores reason', async () => {
      const prisma = createPrismaMock();
      prisma.financingRequest.findUnique.mockResolvedValue({ id: 'fr-003' });
      prisma.financingRequest.update.mockResolvedValue(enrichedRecord('fr-003'));

      const service = new DossiersService(asPrismaService(prisma));
      await service.decideDossier('fr-003', {
        decision: 'reject',
        reason: 'Endettement trop élevé',
      });

      expect(prisma.financingRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'rejected', rejectedReason: 'Endettement trop élevé' },
        }),
      );
    });

    it('request_info: sets status info_requested and clears rejectedReason', async () => {
      const prisma = createPrismaMock();
      prisma.financingRequest.findUnique.mockResolvedValue({ id: 'fr-003' });
      prisma.financingRequest.update.mockResolvedValue(enrichedRecord('fr-003'));

      const service = new DossiersService(asPrismaService(prisma));
      await service.decideDossier('fr-003', { decision: 'request_info' });

      expect(prisma.financingRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'info_requested', rejectedReason: null },
        }),
      );
    });

    it('returns the mapped aggregate after deciding', async () => {
      const prisma = createPrismaMock();
      prisma.financingRequest.findUnique.mockResolvedValue({ id: 'fr-003' });
      prisma.financingRequest.update.mockResolvedValue(enrichedRecord('fr-003'));

      const service = new DossiersService(asPrismaService(prisma));
      const result = await service.decideDossier('fr-003', {
        decision: 'approve',
      });

      expect(result.analyse?.preAssessment).toBe('Trésorerie en tension.');
      expect(result.score?.factors).toHaveLength(1);
    });
  });
});

interface EnrichedRecord {
  id: string;
  type: string;
  status: string;
  fundUsage: string;
  rejectedReason: string | null;
  amount: number;
  durationInMonth: number;
  interestRate: number;
  company: Record<string, unknown>;
  documents: Array<Record<string, unknown>>;
  score: Record<string, unknown> | null;
  completeness: Record<string, unknown> | null;
  connectionSources: Array<Record<string, unknown>>;
  hiddenAccounts: Array<Record<string, unknown>>;
  analyse: Record<string, unknown> | null;
}

function enrichedRecord(id: string): EnrichedRecord {
  return {
    id,
    type: 'loan',
    status: 'pending_review',
    fundUsage: 'Renouvellement flotte véhicules',
    rejectedReason: null,
    amount: 75000,
    durationInMonth: 18,
    interestRate: 7.8,
    company: {
      id: 'c-003',
      name: 'Transport Leclerc Express',
      siren: '756789012',
      businessType: 'Transport routier',
      legalCategory: 'SA',
      codeNaf: '4941A',
      creationDate: new Date('2015-06-20'),
      address: 'ZI Les Platanes, Creil',
      countryCode: 'FR',
      postalCode: '60100',
      owner: 'Jean-Marc Leclerc',
    },
    documents: [
      {
        id: 'd-006',
        name: 'Liasse fiscale 2023',
        type: 'liasse_fiscale',
        metadata: { year: 2023 },
      },
    ],
    score: {
      id: 's-003',
      riskBucket: 'high',
      globalScore: 34,
      confidence: 'medium',
      confidenceReason: 'Historique court',
      calibrationNote: 'Calibré sur 142 cas',
      factors: [
        { id: 'sf-1', label: 'Trésorerie en baisse', direction: 'down', weight: 80 },
      ],
      checkItems: [{ id: 'ci-1', label: 'Vérifier la trésorerie' }],
    },
    completeness: {
      gateStatus: 'complet',
      lastReminderAt: null,
    },
    connectionSources: [
      {
        id: 'cs-1',
        kind: 'bank',
        state: 'connected',
        label: 'Banque (DSP2)',
        detail: '2/2 comptes',
      },
    ],
    hiddenAccounts: [
      { id: 'ha-1', ibanMasked: 'FR76•••4821', pattern: 'Virements récurrents' },
    ],
    analyse: {
      preAssessment: 'Trésorerie en tension.',
      indicators: [
        {
          id: 'in-1',
          label: "Ratio d'endettement",
          category: 'Solvabilité',
          value: '2.8',
          threshold: '≤ 2.0',
          status: 'blocking',
          evidenceLabel: 'liasse 2024 p.4',
          mitigants: [{ id: 'mi-1', text: 'Carnet de commandes 14 mois' }],
        },
      ],
    },
  };
}
