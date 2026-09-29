import { IsBoolean, IsOptional } from 'class-validator';

// POST /routines/items/:id/complete — toggles today's completion (defaults to true).
export class CompleteItemDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
