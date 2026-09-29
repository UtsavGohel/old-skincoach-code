import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthContext } from '../../common/types/auth.types';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { CompleteItemDto } from './dto/complete-item.dto';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import {
  RoutineResponse,
  RoutineService,
  RoutineStats,
} from './routine.service';

@Controller('routines')
@UseGuards(ClerkAuthGuard)
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Get()
  getRoutines(@CurrentUser() auth: AuthContext): Promise<RoutineResponse[]> {
    return this.routineService.getRoutines(auth.clerkId);
  }

  @Post()
  createRoutine(
    @CurrentUser() auth: AuthContext,
    @Body() dto: CreateRoutineDto,
  ): Promise<RoutineResponse> {
    return this.routineService.createRoutine(auth.clerkId, dto);
  }

  // Static route registered before ':id' so "stats" isn't captured as an id.
  @Get('stats')
  getStats(@CurrentUser() auth: AuthContext): Promise<RoutineStats> {
    return this.routineService.getStats(auth.clerkId);
  }

  @Patch(':id')
  updateRoutine(
    @CurrentUser() auth: AuthContext,
    @Param('id') id: string,
    @Body() dto: UpdateRoutineDto,
  ): Promise<RoutineResponse> {
    return this.routineService.updateRoutine(auth.clerkId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteRoutine(
    @CurrentUser() auth: AuthContext,
    @Param('id') id: string,
  ): Promise<void> {
    return this.routineService.deleteRoutine(auth.clerkId, id);
  }

  @Post('items/:id/complete')
  completeItem(
    @CurrentUser() auth: AuthContext,
    @Param('id') id: string,
    @Body() dto: CompleteItemDto,
  ): Promise<{ itemId: string; completed: boolean; logDate: Date }> {
    return this.routineService.completeItem(auth.clerkId, id, dto);
  }
}
