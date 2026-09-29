import {
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Post,
} from '@nestjs/common';

@Controller('scans')
export class ScanController {
  @Post('upload-url')
  getUploadUrl(): never {
    throw new NotImplementedException(
      'Implemented in Phase 16 (Scan & Storage Pipeline)',
    );
  }

  @Post()
  startScan(): never {
    throw new NotImplementedException(
      'Implemented in Phase 16 (Scan & Storage Pipeline)',
    );
  }

  @Get(':scanId/status')
  getScanStatus(@Param('scanId') _scanId: string): never {
    throw new NotImplementedException(
      'Implemented in Phase 17 (Gemini AI Analysis Pipeline)',
    );
  }

  @Get(':scanId')
  getScanResult(@Param('scanId') _scanId: string): never {
    throw new NotImplementedException(
      'Implemented in Phase 17 (Gemini AI Analysis Pipeline)',
    );
  }

  @Get()
  getScanHistory(): never {
    throw new NotImplementedException(
      'Implemented in Phase 18 (Progress/Routine/Coach APIs)',
    );
  }

  @Delete(':scanId')
  deleteScan(@Param('scanId') _scanId: string): never {
    throw new NotImplementedException(
      'Implemented in Phase 16 (Scan & Storage Pipeline)',
    );
  }
}
