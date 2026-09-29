import { Injectable, Logger } from '@nestjs/common';

import { AnalysisService } from '../modules/analysis/analysis.service';
import { ScanQueue } from './scan-queue';

// Dev implementation: run the analysis in the same process, fire-and-forget, so
// POST /scans returns immediately (status `processing`) and the client polls
// GET /scans/:id/status — mirroring the eventual SQS worker flow (enqueue → return →
// process asynchronously). Prod replaces this with an SQS producer + worker Lambda.
@Injectable()
export class InProcessScanQueue extends ScanQueue {
  private readonly logger = new Logger(InProcessScanQueue.name);

  constructor(private readonly analysis: AnalysisService) {
    super();
  }

  enqueueAnalysis(scanId: string): Promise<void> {
    // Intentionally not awaited — the request must not block on Gemini.
    void this.analysis.processScan(scanId).catch((error) => {
      this.logger.error(
        `Background analysis crashed for scan ${scanId}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    });
    return Promise.resolve();
  }
}
