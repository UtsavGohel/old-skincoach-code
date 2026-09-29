import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthContext } from '../../common/types/auth.types';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import {
  CoachChatResponse,
  CoachMessage,
  CoachService,
  CoachTodayResponse,
} from './coach.service';
import { ChatDto } from './dto/chat.dto';

@Controller('coach')
@UseGuards(ClerkAuthGuard)
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('today')
  getTodayInsights(
    @CurrentUser() auth: AuthContext,
  ): Promise<CoachTodayResponse> {
    return this.coachService.getToday(auth.clerkId);
  }

  @Post('chat')
  chat(
    @CurrentUser() auth: AuthContext,
    @Body() dto: ChatDto,
  ): Promise<CoachChatResponse> {
    return this.coachService.chat(auth.clerkId, dto.message);
  }

  @Get('history')
  getChatHistory(@CurrentUser() auth: AuthContext): Promise<CoachMessage[]> {
    return this.coachService.getHistory(auth.clerkId);
  }
}
