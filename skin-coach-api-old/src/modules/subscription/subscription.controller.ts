import { Controller, Get, NotImplementedException, Post } from '@nestjs/common';

@Controller('subscriptions')
export class SubscriptionController {
  @Get('plans')
  getPlans(): never {
    throw new NotImplementedException(
      'Implemented in Phase 19 (Subscription & Feature Gating)',
    );
  }

  @Get('me')
  getMySubscription(): never {
    throw new NotImplementedException(
      'Implemented in Phase 19 (Subscription & Feature Gating)',
    );
  }

  @Post('verify')
  verifyPurchase(): never {
    throw new NotImplementedException(
      'Implemented in Phase 19 (Subscription & Feature Gating)',
    );
  }
}
