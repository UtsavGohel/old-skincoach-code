import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

// PATCH /routines/:id — routine-level fields only (item edits go through create/complete).
export class UpdateRoutineDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
