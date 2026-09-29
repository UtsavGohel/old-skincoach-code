import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';

import { ClerkAuthGuard } from './clerk-auth.guard';

jest.mock('@clerk/backend', () => ({ verifyToken: jest.fn() }));

const mockedVerifyToken = verifyToken as jest.MockedFunction<
  typeof verifyToken
>;

const contextFor = (headers: Record<string, string>) => {
  const request = { headers } as unknown as Request;
  return {
    request,
    ctx: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
  };
};

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;

  const config = {
    get: jest.fn((key: string) =>
      key === 'CLERK_SECRET_KEY' ? 'sk_test_x' : undefined,
    ),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new ClerkAuthGuard(config);
  });

  it('rejects a request with no Authorization header', async () => {
    const { ctx } = contextFor({});
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(mockedVerifyToken).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer scheme', async () => {
    const { ctx } = contextFor({ authorization: 'Basic abc' });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches the verified identity on a valid token', async () => {
    mockedVerifyToken.mockResolvedValue({
      sub: 'user_abc',
      sid: 'sess_1',
    } as never);
    const { ctx, request } = contextFor({ authorization: 'Bearer good.jwt' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(mockedVerifyToken).toHaveBeenCalledWith(
      'good.jwt',
      expect.objectContaining({ secretKey: 'sk_test_x' }),
    );
    expect(request.auth).toEqual({ clerkId: 'user_abc', sessionId: 'sess_1' });
  });

  it('maps a verification failure to a generic 401', async () => {
    mockedVerifyToken.mockRejectedValue(new Error('token expired'));
    const { ctx } = contextFor({ authorization: 'Bearer bad.jwt' });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
