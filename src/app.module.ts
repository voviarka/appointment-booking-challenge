import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CalendarModule } from './calendar/calendar.module';
import { SlotModule } from './slot/slot.module';


const FIVE_MINUTES_IN_MILLISECONDS = 5 * 60 * 1000;

@Module({
  imports: [
    CalendarModule,
    SlotModule,
    CacheModule.register({
      isGlobal: true,
      ttl: FIVE_MINUTES_IN_MILLISECONDS,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
