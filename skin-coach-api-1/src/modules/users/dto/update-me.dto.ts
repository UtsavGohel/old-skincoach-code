import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// PATCH /users/me — partial update of the local user + their skin profile
// (docs/05). Every field is optional; only the provided ones are written. Unknown
// properties are rejected by the global ValidationPipe (whitelist + forbidNonWhitelisted).
export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsInt()
  @Min(13)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  skinType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  primaryGoal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  experienceLevel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  country?: string;
}
