import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { Env } from '../config/env.schema';

// S3-compatible object storage (docs/12: private bucket, signed URLs only, no public
// images). Provider-agnostic — the same code drives Supabase Storage (dev) and
// Cloudflare R2 (prod); only the env values differ. Clients upload/download DIRECTLY
// to storage via presigned URLs, so image bytes never pass through the API (a must on
// Lambda, and keeps the bucket private).
@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  // Uploads are short-lived (the client PUTs immediately after requesting);
  // downloads last an hour so a Results screen can render without re-fetching.
  private static readonly UPLOAD_TTL_SECONDS = 300;
  private static readonly DOWNLOAD_TTL_SECONDS = 3600;

  constructor(config: ConfigService<Env, true>) {
    this.bucket = config.get('STORAGE_BUCKET', { infer: true });
    this.client = new S3Client({
      endpoint: config.get('STORAGE_ENDPOINT', { infer: true }),
      region: config.get('STORAGE_REGION', { infer: true }),
      credentials: {
        accessKeyId: config.get('STORAGE_ACCESS_KEY_ID', { infer: true }),
        secretAccessKey: config.get('STORAGE_SECRET_ACCESS_KEY', {
          infer: true,
        }),
      },
      // Required for Supabase Storage's S3 endpoint (and R2-compatible): address the
      // bucket as a path segment rather than a subdomain.
      forcePathStyle: true,
    });
  }

  // Presigned PUT URL the client uploads the raw image to. ContentType is bound into
  // the signature so the client can't upload a different type than was validated.
  createUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, {
      expiresIn: StorageService.UPLOAD_TTL_SECONDS,
    });
  }

  // Presigned GET URL for reading a private object (docs/12: only the owner, via a
  // short-lived signed URL — the object is never public).
  createDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, {
      expiresIn: StorageService.DOWNLOAD_TTL_SECONDS,
    });
  }

  // Fetches the raw object bytes — used server-side (the analysis pipeline sends the
  // image to Gemini). Not exposed to clients, who only ever get presigned URLs.
  async getObjectBuffer(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    if (!response.Body) {
      throw new Error(`Empty object body for key ${key}`);
    }
    const bytes = await response.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
