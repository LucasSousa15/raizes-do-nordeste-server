import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({
      connectionString,
      // Evita ficar “silencioso” minutos quando o Postgres não está acessível
      connectionTimeoutMillis: 10_000,
    });

    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: ['warn', 'error'],
    });
  }

  async onModuleInit() {
    console.log('[Prisma] Conectando ao banco…');
    await this.$connect();
    console.log('[Prisma] Conectado (adapter pg).');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}