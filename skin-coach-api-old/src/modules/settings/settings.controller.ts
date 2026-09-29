import {
  Controller,
  Get,
  NotImplementedException,
  Patch,
} from '@nestjs/common';

@Controller('settings')
export class SettingsController {
  @Get()
  getSettings(): never {
    throw new NotImplementedException(
      'Implemented in Phase 15/18 alongside user + settings sync',
    );
  }

  @Patch()
  updateSettings(): never {
    throw new NotImplementedException(
      'Implemented in Phase 15/18 alongside user + settings sync',
    );
  }
}
