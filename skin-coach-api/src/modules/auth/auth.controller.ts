import { Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import type { SvixHeaders } from './auth.service';

@Controller('webhooks')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Clerk user.created/updated/deleted -> upserts/soft-deletes our users mirror.
  // Uses the raw body (enabled via rawBody:true in main.ts) so the Svix HMAC still
  // matches. Returns 200 on success so Clerk marks the delivery as acknowledged;
  // any verification/handler failure surfaces as a 4xx and Clerk retries.
  @Post('clerk')
  @HttpCode(200)
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: SvixHeaders,
  ): Promise<{ success: true }> {
    const rawBody = req.rawBody?.toString('utf8') ?? '';
    await this.authService.handleClerkWebhook(rawBody, headers);
    return { success: true };
  }
}
