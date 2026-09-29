import { Module } from '@nestjs/common';

import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { UsersModule } from '../users/users.module';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';

// GeminiService (AiModule) + PromptService (PromptModule) are @Global.
@Module({
  imports: [UsersModule],
  controllers: [CoachController],
  providers: [CoachService, ClerkAuthGuard],
})
export class CoachModule {}
