import { IsIn, IsOptional, IsString } from 'class-validator';

import type { DossierDecision } from './dossiers.types';

export class DecisionDto {
  @IsIn(['approve', 'reject', 'request_info'])
  decision!: DossierDecision;

  @IsOptional()
  @IsString()
  reason?: string;
}
