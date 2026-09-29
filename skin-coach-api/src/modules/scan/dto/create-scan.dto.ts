import { IsOptional, IsString, MaxLength } from 'class-validator';

// docs/05 Start Scan: { imageKey, device }. imageKey is the object key returned by
// POST /scans/upload-url (ownership is re-checked server-side against the caller).
export class CreateScanDto {
  @IsString()
  @MaxLength(256)
  imageKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  device?: string;
}
