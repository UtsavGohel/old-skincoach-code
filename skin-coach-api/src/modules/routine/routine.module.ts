import { Module } from '@nestjs/common';

import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { UsersModule } from '../users/users.module';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';

@Module({
  imports: [UsersModule],
  controllers: [RoutineController],
  providers: [RoutineService, ClerkAuthGuard],
  exports: [RoutineService],
})
export class RoutineModule {}
