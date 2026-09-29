import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthContext } from '../../common/types/auth.types';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { CreateScanDto } from './dto/create-scan.dto';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import {
  CreateScanResponse,
  ScanHistoryEntry,
  ScanResultResponse,
  ScanService,
  ScanStatusResponse,
  UploadUrlResponse,
} from './scan.service';

// All scan routes are owner-scoped: the local user is resolved from the verified
// Clerk id (docs/12), never from a client-supplied id.
@Controller('scans')
@UseGuards(ClerkAuthGuard)
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post('upload-url')
  getUploadUrl(
    @CurrentUser() auth: AuthContext,
    @Body() dto: CreateUploadUrlDto,
  ): Promise<UploadUrlResponse> {
    return this.scanService.createUploadUrl(auth.clerkId, dto);
  }

  @Post()
  startScan(
    @CurrentUser() auth: AuthContext,
    @Body() dto: CreateScanDto,
  ): Promise<CreateScanResponse> {
    return this.scanService.createScan(auth.clerkId, dto);
  }

  @Get(':scanId/status')
  getScanStatus(
    @CurrentUser() auth: AuthContext,
    @Param('scanId') scanId: string,
  ): Promise<ScanStatusResponse> {
    return this.scanService.getScanStatus(auth.clerkId, scanId);
  }

  @Get(':scanId')
  getScanResult(
    @CurrentUser() auth: AuthContext,
    @Param('scanId') scanId: string,
  ): Promise<ScanResultResponse> {
    return this.scanService.getScanResult(auth.clerkId, scanId);
  }

  @Get()
  getScanHistory(
    @CurrentUser() auth: AuthContext,
  ): Promise<ScanHistoryEntry[]> {
    return this.scanService.getScanHistory(auth.clerkId);
  }

  @Delete(':scanId')
  @HttpCode(204)
  deleteScan(
    @CurrentUser() auth: AuthContext,
    @Param('scanId') scanId: string,
  ): Promise<void> {
    return this.scanService.deleteScan(auth.clerkId, scanId);
  }
}
