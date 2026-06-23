import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import type {
  DossierAggregate,
  DossierQueueItem,
} from './dossiers.types';

// Prisma payload types derived from the includes below. Keeping them named and
// derived (rather than `any`) means the mappers stay honest if the schema moves.
type QueueRecord = Prisma.FinancingRequestGetPayload<{
  include: {
    company: { select: { id: true; name: true; siren: true; businessType: true } };
    score: { select: { riskBucket: true; globalScore: true } };
  };
}>;

type AggregateRecord = Prisma.FinancingRequestGetPayload<{
  include: { company: true; documents: true; score: true };
}>;

@Injectable()
export class DossiersService {
  constructor(private readonly prisma: PrismaService) {}

  async listDossiers(): Promise<DossierQueueItem[]> {
    const records = await this.prisma.financingRequest.findMany({
      include: {
        company: {
          select: { id: true, name: true, siren: true, businessType: true },
        },
        score: { select: { riskBucket: true, globalScore: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return records.map((record) => this.toQueueItem(record));
  }

  async getDossier(id: string): Promise<DossierAggregate> {
    const record = await this.prisma.financingRequest.findUnique({
      where: { id },
      include: { company: true, documents: true, score: true },
    });

    if (record === null) {
      throw new NotFoundException(`Dossier "${id}" not found`);
    }

    return this.toAggregate(record);
  }

  /** Pure mapper — unit-testable without a database. */
  toQueueItem(record: QueueRecord): DossierQueueItem {
    return {
      id: record.id,
      company: {
        id: record.company.id,
        name: record.company.name,
        siren: record.company.siren,
        businessType: record.company.businessType,
      },
      type: record.type,
      status: record.status,
      amount: record.amount,
      durationInMonth: record.durationInMonth,
      score:
        record.score === null
          ? null
          : {
              riskBucket: record.score.riskBucket,
              globalScore: record.score.globalScore,
            },
    };
  }

  /** Pure mapper — unit-testable without a database. */
  toAggregate(record: AggregateRecord): DossierAggregate {
    return {
      company: {
        id: record.company.id,
        name: record.company.name,
        siren: record.company.siren,
        businessType: record.company.businessType,
        legalCategory: record.company.legalCategory,
        codeNaf: record.company.codeNaf,
        creationDate: record.company.creationDate,
        address: record.company.address,
        countryCode: record.company.countryCode,
        postalCode: record.company.postalCode,
        owner: record.company.owner,
      },
      financingRequest: {
        id: record.id,
        type: record.type,
        status: record.status,
        fundUsage: record.fundUsage,
        rejectedReason: record.rejectedReason,
        amount: record.amount,
        durationInMonth: record.durationInMonth,
        interestRate: record.interestRate,
      },
      documents: record.documents.map((document) => ({
        id: document.id,
        name: document.name,
        type: document.type,
        metadata: document.metadata,
      })),
      score:
        record.score === null
          ? null
          : {
              id: record.score.id,
              riskBucket: record.score.riskBucket,
              globalScore: record.score.globalScore,
            },
    };
  }
}
