import { Module } from '@nestjs/common';

import { AnalysisModule } from '../modules/analysis/analysis.module';
import { InProcessScanQueue } from './in-process-scan.queue';
import { ScanQueue } from './scan-queue';

// Binds the ScanQueue port to its dev implementation (in-process). Swapping to SQS in
// prod is a one-line change of `useClass` here — nothing else moves.
@Module({
  imports: [AnalysisModule],
  providers: [{ provide: ScanQueue, useClass: InProcessScanQueue }],
  exports: [ScanQueue],
})
export class QueueModule {}
