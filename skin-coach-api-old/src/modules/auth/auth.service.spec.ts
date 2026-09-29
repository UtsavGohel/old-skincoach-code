import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

// Factory mock so jest never loads svix's real source (which fails to transform
// under ts-jest). Only the Webhook constructor is used by AuthService.
jest.mock('svix', () => ({ Webhook: jest.fn() }));

const MockedWebhook = Webhook as unknown as jest.Mock;

const validHeaders = {
  'svix-id': 'msg_1',
  'svix-timestamp': '1700000000',
  'svix-signature': 'v1,sig',
};

describe('AuthService', () => {
  let service: AuthService;
  let verify: jest.Mock;
  const syncFromClerkEvent = jest.fn();

  const config = {
    get: jest.fn(() => 'whsec_test'),
  } as unknown as ConfigService;
  const usersService = { syncFromClerkEvent } as unknown as UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    verify = jest.fn();
    MockedWebhook.mockImplementation(() => ({ verify }));
    service = new AuthService(config, usersService);
  });

  it('rejects when Svix headers are missing', async () => {
    await expect(service.handleClerkWebhook('{}', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(verify).not.toHaveBeenCalled();
    expect(syncFromClerkEvent).not.toHaveBeenCalled();
  });

  it('verifies with the raw body and forwards the event to the users mirror', async () => {
    const event = { type: 'user.created', data: { id: 'u1' } };
    verify.mockReturnValue(event);
    const raw = '{"type":"user.created"}';

    await service.handleClerkWebhook(raw, validHeaders);

    expect(verify).toHaveBeenCalledWith(raw, validHeaders);
    expect(syncFromClerkEvent).toHaveBeenCalledWith(event);
  });

  it('maps a bad signature to 401 and never syncs', async () => {
    verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    await expect(
      service.handleClerkWebhook('{}', validHeaders),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(syncFromClerkEvent).not.toHaveBeenCalled();
  });
});
