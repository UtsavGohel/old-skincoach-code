import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import type { AuthContext } from '../types/auth.types';

// Pulls the verified Clerk identity that ClerkAuthGuard attached to the request.
// Throwing here (rather than returning undefined) means a handler that asks for the
// current user can never accidentally run unauthenticated — a missing `auth` implies
// the guard wasn't applied, which is a programming error, not a client error.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.auth) {
      throw new UnauthorizedException('Not authenticated');
    }
    return request.auth;
  },
);
