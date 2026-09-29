import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// PATCH /settings — user_settings fields (docs/04). All optional (partial update).
export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  dailyScanReminder?: boolean;

  @IsOptional()
  @IsBoolean()
  morningReminder?: boolean;

  @IsOptional()
  @IsBoolean()
  nightReminder?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  timezone?: string;
}
