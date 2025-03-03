import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { SlotBookingsDto } from './dto/slot-bookings.dto';
import { BookedSlotDto } from './dto/booked-slot.dto';
import { SlotService } from './slot.service';

@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Post('bookings')
  @ApiResponse({
    status: 200,
    description: 'Book a slot for user',
    type: [BookedSlotDto],
  })
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  async bookSlot(
    @Body() slotBookingsDto: SlotBookingsDto,
  ): Promise<BookedSlotDto> {
    return this.slotService.bookSlot(slotBookingsDto) as Promise<BookedSlotDto>;
  }
}
