import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateRoutineItemDto {
  @IsString()
  @MaxLength(120)
  productName!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  stepOrder!: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  productType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  instructions?: string;

  // "HH:mm" 24-hour local reminder time (docs/03 Routine Item reminder).
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'reminderTime must be HH:mm (24-hour)',
  })
  reminderTime?: string;
}

export class CreateRoutineDto {
  @IsString()
  @MaxLength(80)
  name!: string;

  @IsIn(['morning', 'night'])
  timeOfDay!: 'morning' | 'night';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRoutineItemDto)
  items!: CreateRoutineItemDto[];
}
