import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';

import type { Env } from '../../config/env.schema';
import { UsersService } from '../users/users.service';
import type { ClerkWebhookEvent } from './clerk-webhook.types';

// The Svix headers Clerk signs each webhook with. Missing any of them means the
// request didn't come through Svix and must be rejected before verification.
export interface SvixHeaders {
  'svix-id'?: string;
  'svix-timestamp'?: string;
  'svix-signature'?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly usersService: UsersService,
  ) {}

  // Verifies a Clerk webhook against CLERK_WEBHOOK_SECRET (Svix) using the RAW
  // request body — re-serialized JSON would change the bytes and break the HMAC —
  // then applies it to the users mirror (docs/19 Phase 15).
  async handleClerkWebhook(
    rawBody: string,
    headers: SvixHeaders,
  ): Promise<void> {
    const event = this.verify(rawBody, headers);
    await this.usersService.syncFromClerkEvent(event);
  }

  private verify(rawBody: string, headers: SvixHeaders): ClerkWebhookEvent {
    const svixId = headers['svix-id'];
    const svixTimestamp = headers['svix-timestamp'];
    const svixSignature = headers['svix-signature'];
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing Svix signature headers');
    }

    const wh = new Webhook(
      this.config.get('CLERK_WEBHOOK_SECRET', { infer: true }),
    );
    try {
      return wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;
    } catch (error) {
      this.logger.warn(
        `Clerk webhook verification failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }
}
