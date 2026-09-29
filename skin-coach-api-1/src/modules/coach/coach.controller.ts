import { Controller, Get, NotImplementedException, Post } from '@nestjs/common';

@Controller('coach')
export class CoachController {
  @Get('today')
  getTodayInsights(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }

  @Post('chat')
  chat(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }

  @Get('history')
  getChatHistory(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }
}
