import { Module } from '@nestjs/common';

import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { UsersModule } from '../users/users.module';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';

// Not in docs/08's module list, but docs/05 (GET /achievements) and docs/04
// (achievements + user_achievements tables) require it.
@Module({
  imports: [UsersModule],
  controllers: [AchievementsController],
  providers: [AchievementsService, ClerkAuthGuard],
})
export class AchievementsModule {}
