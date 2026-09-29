import { Module } from '@nestjs/common';

import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';

// Not listed in docs/08's module list, but docs/05 (GET /achievements) and docs/04
// (achievements + user_achievements tables) both require it — added for completeness.
@Module({
  controllers: [AchievementsController],
  providers: [AchievementsService],
})
export class AchievementsModule {}
