import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { Env } from '../config/env.schema';
import { StorageService } from './storage.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: jest.fn() }));
const mockedGetSignedUrl = getSignedUrl as jest.Mock;

type CommandLike = { input: Record<string, unknown> };

const configValues: Record<string, string> = {
  STORAGE_BUCKET: 'skincoach-scans',
  STORAGE_ENDPOINT: 'https://ref.storage.supabase.co/storage/v1/s3',
  STORAGE_REGION: 'ap-south-1',
  STORAGE_ACCESS_KEY_ID: 'akid',
  STORAGE_SECRET_ACCESS_KEY: 'secret',
};

describe('StorageService', () => {
  let service: StorageService;

  const config = {
    get: jest.fn((key: string) => configValues[key]),
  } as unknown as ConfigService<Env, true>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StorageService(config);
  });

  it('createUploadUrl presigns a PUT with the key + contentType and a 5-min TTL', async () => {
    mockedGetSignedUrl.mockResolvedValue('https://signed-put');

    const url = await service.createUploadUrl('scans/u1/abc.jpg', 'image/jpeg');

    expect(url).toBe('https://signed-put');
    const [, command, opts] = mockedGetSignedUrl.mock.calls[0];
    expect((command as CommandLike).input).toMatchObject({
      Bucket: 'skincoach-scans',
      Key: 'scans/u1/abc.jpg',
      ContentType: 'image/jpeg',
    });
    expect(opts).toEqual({ expiresIn: 300 });
  });

  it('createDownloadUrl presigns a GET with a 1-hour TTL', async () => {
    mockedGetSignedUrl.mockResolvedValue('https://signed-get');

    const url = await service.createDownloadUrl('scans/u1/abc.jpg');

    expect(url).toBe('https://signed-get');
    const [, command, opts] = mockedGetSignedUrl.mock.calls[0];
    expect((command as CommandLike).input).toMatchObject({
      Bucket: 'skincoach-scans',
      Key: 'scans/u1/abc.jpg',
    });
    expect(opts).toEqual({ expiresIn: 3600 });
  });

  it('deleteObject sends a DeleteObjectCommand for the key', async () => {
    const sendSpy = jest
      .spyOn(S3Client.prototype, 'send')
      .mockResolvedValue(undefined as never);

    await service.deleteObject('scans/u1/abc.jpg');

    expect(sendSpy).toHaveBeenCalledTimes(1);
    const command = sendSpy.mock.calls[0][0] as unknown as CommandLike;
    expect(command.input).toMatchObject({
      Bucket: 'skincoach-scans',
      Key: 'scans/u1/abc.jpg',
    });
    sendSpy.mockRestore();
  });
});
