import { Module } from '@nestjs/common';

import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { UsersModule } from '../users/users.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [UsersModule],
  controllers: [ProgressController],
  providers: [ProgressService, ClerkAuthGuard],
})
export class ProgressModule {}
