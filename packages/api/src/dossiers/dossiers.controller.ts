import { Controller, Get, Param } from '@nestjs/common';

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
}
