import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    // Eagerly open the pool, but do not let an unreachable DB block HTTP
    // startup — the health endpoint must stay answerable so the container
    // healthcheck and orchestrator can observe the process is alive. Prisma
    // reconnects lazily on the next query if this initial attempt fails.
    try {
      await this.$connect();
    } catch (error) {
      this.logger.error(
        'Initial database connection failed; will retry on first query',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
