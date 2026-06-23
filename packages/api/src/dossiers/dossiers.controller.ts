import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { DecisionDto } from './decision.dto';
import { DossiersService } from './dossiers.service';
import type { DossierAggregate, DossierQueueItem } from './dossiers.types';

@Controller('dossiers')
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @Get()
  listDossiers(): Promise<DossierQueueItem[]> {
    return this.dossiersService.listDossiers();
  }

  @Get(':id')
  getDossier(@Param('id') id: string): Promise<DossierAggregate> {
    return this.dossiersService.getDossier(id);
  }

  @Post(':id/decision')
  decideDossier(
    @Param('id') id: string,
    @Body() dto: DecisionDto,
  ): Promise<DossierAggregate> {
    return this.dossiersService.decideDossier(id, dto);
  }
}
