import {
  Controller,
  Get,
  NotImplementedException,
  Param,
  Patch,
} from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  @Get()
  getNotifications(): never {
    throw new NotImplementedException(
      'Implemented in Phase 20 (Notifications)',
    );
  }

  @Patch(':id/read')
  markAsRead(@Param('id') _id: string): never {
    throw new NotImplementedException(
      'Implemented in Phase 20 (Notifications)',
    );
  }
}
