import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { QuerySlotsDto } from './dto/query-slots.dto';
import { AvailableSlotDto } from './dto/available-slot.dto';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('query')
  @ApiResponse({
    status: 200,
    description: 'Returns available slots with counts',
    type: [AvailableSlotDto],
  })
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  async queryAvailableSlots(
    @Body() queryDto: QuerySlotsDto,
  ): Promise<AvailableSlotDto[]> {
    return this.calendarService.queryAvailableSlots(queryDto);
  }
}
