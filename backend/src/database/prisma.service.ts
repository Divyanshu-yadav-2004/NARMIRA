import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    const adapter = new PrismaPg({ connectionString: config.getOrThrow<string>('DATABASE_URL') });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log(JSON.stringify({ event: 'database_client_initialized' }));
    } catch {
      this.logger.error(JSON.stringify({ event: 'database_connection_failed' }));
      // Keep process liveness available so the readiness endpoint can return
      // 503 while PostgreSQL is down. Prisma's pool can reconnect on later queries.
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
