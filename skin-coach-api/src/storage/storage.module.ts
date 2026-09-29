import { Global, Module } from '@nestjs/common';

import { StorageService } from './storage.service';

// Global so any feature module (scans now, profile images later) can inject the
// shared StorageService without re-importing this module.
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
