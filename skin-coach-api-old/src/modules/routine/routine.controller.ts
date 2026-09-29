import {
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('routines')
export class RoutineController {
  @Get()
  getRoutines(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }

  @Post()
  createRoutine(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }

  @Patch(':id')
  updateRoutine(@Param('id') _id: string): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }

  @Delete(':id')
  deleteRoutine(@Param('id') _id: string): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }

  @Post('items/:id/complete')
  completeRoutineItem(@Param('id') _id: string): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }

  @Get('stats')
  getRoutineStats(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }
}
