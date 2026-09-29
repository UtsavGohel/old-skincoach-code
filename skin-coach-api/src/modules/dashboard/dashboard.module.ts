import { Module } from '@nestjs/common';

import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { RoutineModule } from '../routine/routine.module';
import { UsersModule } from '../users/users.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [UsersModule, RoutineModule],
  controllers: [DashboardController],
  providers: [DashboardService, ClerkAuthGuard],
})
export class DashboardModule {}
