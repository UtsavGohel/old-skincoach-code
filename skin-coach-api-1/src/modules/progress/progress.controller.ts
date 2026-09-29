import { Controller, Get, NotImplementedException } from '@nestjs/common';

@Controller('progress')
export class ProgressController {
  @Get()
  getSummary(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }

  @Get('timeline')
  getTimeline(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }

  @Get('chart')
  getChart(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }
}
