import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma CLI (migrate/studio/db pull) must bypass the DB's connection pooler
// (Supabase Supavisor in dev, Neon PgBouncer in prod), so this points at
// DIRECT_URL — the app's own runtime connection (pooled DATABASE_URL) is
// configured separately in PrismaService via the pg driver adapter.
export default defineConfig({
  schema: 'src/database/prisma/schema.prisma',
  migrations: {
    path: 'src/database/prisma/migrations',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
