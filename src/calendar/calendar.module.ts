import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [CacheModule.register(), PrismaModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
