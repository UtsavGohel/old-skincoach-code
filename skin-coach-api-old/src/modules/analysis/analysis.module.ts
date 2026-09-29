import { Module } from '@nestjs/common';

import { AnalysisService } from './analysis.service';

// No controller: per docs/06, analysis is triggered internally by the scan pipeline
// (queue processor), not exposed as its own public REST resource. Results are
// returned via GET /scans/:scanId (see ScanController).
@Module({
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
