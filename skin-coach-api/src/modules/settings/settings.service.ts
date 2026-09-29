import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import type { UpdateSettingsDto } from './dto/update-settings.dto';

export interface SettingsResponse {
  dailyScanReminder: boolean;
  morningReminder: boolean;
  nightReminder: boolean;
  language: string;
  theme: string;
  timezone: string | null;
}

const DEFAULTS: SettingsResponse = {
  dailyScanReminder: true,
  morningReminder: true,
  nightReminder: true,
  language: 'en',
  theme: 'system',
  timezone: null,
};

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  // Returns the user's settings, or the schema defaults if they've never saved any.
  async getSettings(clerkId: string): Promise<SettingsResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });
    return settings ? this.toResponse(settings) : DEFAULTS;
  }

  async updateSettings(
    clerkId: string,
    dto: UpdateSettingsDto,
  ): Promise<SettingsResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    // undefined fields fall back to schema defaults on create / are skipped on update.
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto },
    });
    return this.toResponse(settings);
  }

  private toResponse(s: SettingsResponse): SettingsResponse {
    return {
      dailyScanReminder: s.dailyScanReminder,
      morningReminder: s.morningReminder,
      nightReminder: s.nightReminder,
      language: s.language,
      theme: s.theme,
      timezone: s.timezone,
    };
  }
}
