import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '../generated/prisma/client';

// Prisma 7 requires an explicit driver adapter — there is no more implicit
// connection-string parsing inside PrismaClient itself. This uses the runtime
// DATABASE_URL (Supabase in dev, Neon in prod) for the app; the Prisma CLI
// (migrate/studio) uses DIRECT_URL instead, configured separately in
// prisma.config.ts, since migrations must bypass the pooler.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ adapter: new PrismaPg(PrismaService.createPool()) });
  }

  // Supabase's connection pooler presents a self-signed cert chain. pg 8.x treats
  // `sslmode=require` (in the URL) as strict `verify-full` and rejects it, so we
  // neutralize the URL's sslmode and configure TLS explicitly: still encrypted,
  // but without chain verification. TODO(prod): pin Supabase's CA cert via
  // `ssl: { ca: <pem> }` instead of disabling verification.
  private static createPool(): Pool {
    const connectionString = (process.env.DATABASE_URL ?? '').replace(
      /sslmode=[^&]+/i,
      'sslmode=no-verify',
    );
    return new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
