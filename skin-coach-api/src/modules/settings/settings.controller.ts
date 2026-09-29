import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthContext } from '../../common/types/auth.types';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponse, SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(ClerkAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@CurrentUser() auth: AuthContext): Promise<SettingsResponse> {
    return this.settingsService.getSettings(auth.clerkId);
  }

  @Patch()
  updateSettings(
    @CurrentUser() auth: AuthContext,
    @Body() dto: UpdateSettingsDto,
  ): Promise<SettingsResponse> {
    return this.settingsService.updateSettings(auth.clerkId, dto);
  }
}
