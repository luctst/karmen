import { NotFoundException } from '@nestjs/common';

import type { PrismaService } from '../prisma/prisma.service';
import { DossiersService } from './dossiers.service';

interface PrismaMock {
  financingRequest: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
  };
}

function createPrismaMock(): PrismaMock {
  return {
    financingRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
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

    it('maps the full aggregate including documents and score', async () => {
      const prisma = createPrismaMock();
      prisma.financingRequest.findUnique.mockResolvedValue({
        id: 'fr-003',
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
        score: { id: 's-003', riskBucket: 'high', globalScore: 34 },
      });

      const service = new DossiersService(asPrismaService(prisma));
      const result = await service.getDossier('fr-003');

      expect(result.company.owner).toBe('Jean-Marc Leclerc');
      expect(result.financingRequest.interestRate).toBe(7.8);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].metadata).toEqual({ year: 2023 });
      expect(result.score).toEqual({
        id: 's-003',
        riskBucket: 'high',
        globalScore: 34,
      });
      // companyId is intentionally not surfaced on the financingRequest node.
      expect(result.financingRequest).not.toHaveProperty('companyId');
    });
  });
});
