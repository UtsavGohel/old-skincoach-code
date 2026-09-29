import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

// AI analysis must run asynchronously, never blocking the request (docs/06, docs/08).
// Backed by Upstash (hosted Redis) — no local Redis needed. Queues/processors are
// registered here as they're implemented, starting with the scan queue in Phase 17.
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: { url: process.env.UPSTASH_REDIS_URL },
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
