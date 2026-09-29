import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';

import type { Env } from '../config/env.schema';

// Verifies the Clerk-issued session JWT on protected routes (docs/12: JWT auth,
// docs/19 Phase 15). Stateless — no session lookup — which is the right fit for
// Lambda. On success it attaches the verified identity to `request.auth` for
// downstream handlers/decorators (@CurrentUser); on any failure it 401s and never
// leaks the underlying verification error to the client.
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const jwtKey = this.config.get('CLERK_JWT_KEY', { infer: true });
      const payload = await verifyToken(token, {
        secretKey: this.config.get('CLERK_SECRET_KEY', { infer: true }),
        // When a PEM is configured, verification is networkless; otherwise
        // @clerk/backend fetches (and caches) JWKS using the secret key.
        ...(jwtKey ? { jwtKey } : {}),
      });

      request.auth = { clerkId: payload.sub, sessionId: payload.sid };
      return true;
    } catch (error) {
      // Log the reason server-side for debugging, but return a generic 401 so we
      // never disclose token internals to the caller (docs/12).
      this.logger.warn(
        `Clerk token verification failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractBearerToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) {
      return null;
    }
    const [scheme, token] = header.split(' ');
    return scheme === 'Bearer' && token ? token : null;
  }
}
