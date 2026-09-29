import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

// Global so every feature module can inject PrismaService without re-importing
// this module everywhere (docs/08: modules never talk to the DB directly except
// through this shared service).
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
