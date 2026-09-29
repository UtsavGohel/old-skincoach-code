import { Module } from '@nestjs/common';

import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { UsersModule } from '../users/users.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [UsersModule],
  controllers: [SettingsController],
  providers: [SettingsService, ClerkAuthGuard],
})
export class SettingsModule {}
