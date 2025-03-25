import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';
import { BookedSlotDto } from './dto/booked-slot.dto';
import { SlotBookingsDto } from './dto/slot-bookings.dto';

@Injectable()
export class SlotService {
  private readonly logger = new Logger(SlotService.name);

  constructor(private prisma: PrismaService) {}

  async bookSlot({
    slotIds,
    userId,
  }: SlotBookingsDto): Promise<BookedSlotDto | undefined> {
    let slot = [];

    try {
      return this.prisma.$transaction(async (tx) => {
        for (const slotId of slotIds) {
          slot = await tx.$queryRawUnsafe(
            `SELECT id
             FROM slots
             WHERE id = ${slotId}
               AND booked = false FOR UPDATE SKIP LOCKED`,
            slotId,
          );

          if (slot.length > 0) {
            const bookedSlot = await tx.slot.update({
              where: { id: slotId },
              data: {
                booked: true,
                user_id: userId,
              },
            });

            this.logger.log(`Slot booked: ${bookedSlot.id}`);

            return bookedSlot as BookedSlotDto;
          }
        }

        throw new NotFoundException('No available slots found');
      });
    } catch (error: unknown) {
      this.logger.error('Error booking slot', error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error booking slot',
      );
    }
  }
}
