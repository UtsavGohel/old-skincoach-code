import { Module } from '@nestjs/common';

import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { QueueModule } from '../../queue/queue.module';
import { UsersModule } from '../users/users.module';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';

// UsersModule → getLocalUserId (owner scoping); QueueModule → ScanQueue (triggers
// analysis); StorageModule is @Global. ClerkAuthGuard provided here so @UseGuards can
// resolve it with ConfigService.
@Module({
  imports: [UsersModule, QueueModule],
  controllers: [ScanController],
  providers: [ScanService, ClerkAuthGuard],
})
export class ScanModule {}
