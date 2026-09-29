// Port for kicking off a scan's AI analysis out-of-band. The scan pipeline depends
// only on this abstraction, so the trigger mechanism swaps without touching the
// analysis logic: in-process (dev) → SQS send + worker Lambda (prod). Used as the
// Nest DI token (abstract class).
export abstract class ScanQueue {
  abstract enqueueAnalysis(scanId: string): Promise<void>;
}
