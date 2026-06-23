import { Injectable, NotFoundException } from '@nestjs/common';
import { type Prisma, RequestStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import type { DecisionDto } from './decision.dto';
import type {
  DossierAggregate,
  DossierDecision,
  DossierQueueItem,
} from './dossiers.types';

type QueueRecord = Prisma.FinancingRequestGetPayload<{
  include: {
    company: { select: { id: true; name: true; siren: true; businessType: true } };
    score: { select: { riskBucket: true; globalScore: true } };
  };
}>;

const aggregateInclude = {
  company: true,
  documents: true,
  score: { include: { factors: true, checkItems: true } },
  completeness: true,
  connectionSources: true,
  hiddenAccounts: true,
  analyse: { include: { indicators: { include: { mitigants: true } } } },
} satisfies Prisma.FinancingRequestInclude;

type AggregateRecord = Prisma.FinancingRequestGetPayload<{
  include: typeof aggregateInclude;
}>;

const decisionStatus: Record<DossierDecision, RequestStatus> = {
  approve: RequestStatus.approved,
  reject: RequestStatus.rejected,
  request_info: RequestStatus.info_requested,
};

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
      include: aggregateInclude,
    });

    if (record === null) {
      throw new NotFoundException(`Dossier "${id}" not found`);
    }

    return this.toAggregate(record);
  }

  async decideDossier(id: string, dto: DecisionDto): Promise<DossierAggregate> {
    const existing = await this.prisma.financingRequest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (existing === null) {
      throw new NotFoundException(`Dossier "${id}" not found`);
    }

    const record = await this.prisma.financingRequest.update({
      where: { id },
      data: {
        status: decisionStatus[dto.decision],
        rejectedReason: dto.decision === 'reject' ? (dto.reason ?? null) : null,
      },
      include: aggregateInclude,
    });

    return this.toAggregate(record);
  }

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
              confidence: record.score.confidence,
              confidenceReason: record.score.confidenceReason,
              calibrationNote: record.score.calibrationNote,
              factors: record.score.factors.map((factor) => ({
                id: factor.id,
                label: factor.label,
                direction: factor.direction,
                weight: factor.weight,
              })),
              checkItems: record.score.checkItems.map((checkItem) => ({
                id: checkItem.id,
                label: checkItem.label,
              })),
            },
      completeness:
        record.completeness === null
          ? null
          : {
              gateStatus: record.completeness.gateStatus,
              lastReminderAt: record.completeness.lastReminderAt,
              sources: record.connectionSources.map((source) => ({
                id: source.id,
                state: source.state,
                label: source.label,
                detail: source.detail,
              })),
              hiddenAccounts: record.hiddenAccounts.map((account) => ({
                id: account.id,
                ibanMasked: account.ibanMasked,
                pattern: account.pattern,
              })),
            },
      analyse:
        record.analyse === null
          ? null
          : {
              preAssessment: record.analyse.preAssessment,
              indicators: record.analyse.indicators.map((indicator) => ({
                id: indicator.id,
                label: indicator.label,
                value: indicator.value,
                threshold: indicator.threshold,
                status: indicator.status,
                mitigants: indicator.mitigants.map((mitigant) => ({
                  id: mitigant.id,
                  text: mitigant.text,
                })),
              })),
            },
    };
  }
}
