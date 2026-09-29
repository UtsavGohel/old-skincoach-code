import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

// docs/06 Step 1: capture format is JPEG, max 8 MB. We validate the declared type
// (bound into the presigned PUT signature) and, if supplied, the declared size.
export const ALLOWED_IMAGE_CONTENT_TYPES = ['image/jpeg'] as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

export class CreateUploadUrlDto {
  @IsIn(ALLOWED_IMAGE_CONTENT_TYPES)
  contentType!: (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number];

  // Optional client-declared size — lets us reject an oversized image before it's
  // uploaded. Not a hard guarantee (the client controls it); the AI pipeline
  // re-validates the actual bytes in Phase 17.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_IMAGE_BYTES)
  fileSize?: number;
}
