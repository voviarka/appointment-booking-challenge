import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';

@Module({
  imports: [PrismaModule],
  controllers: [SlotController],
  providers: [SlotService, PrismaService],
})
export class SlotModule {}
