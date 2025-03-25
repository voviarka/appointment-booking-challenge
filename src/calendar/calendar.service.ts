import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QuerySlotsDto } from './dto/query-slots.dto';
import { AvailableSlotDto } from './dto/available-slot.dto';
import { Language } from './types/language.type';
import { Rating } from './types/rating.type';
import { Product } from './types/product.type';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
  ) {}
  async queryAvailableSlots({
    rating,
    date,
    language,
    products,
  }: QuerySlotsDto): Promise<AvailableSlotDto[]> {
    const cacheKey = `slots:${date}:${language}:${rating}:${products.join(',')}`;
    const cachedAvailableSlots = await this.getCachedData(cacheKey);

    if (cachedAvailableSlots) {
      return cachedAvailableSlots;
    }

    try {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);

      // Find language, rating, and product IDs
      const languageId = await this.prisma.language.findUnique({
        where: { name: language },
        select: { id: true },
      });

      const ratingId = await this.prisma.customerRating.findUnique({
        where: { name: rating },
        select: { id: true },
      });

      const productIds = await this.prisma.product.findMany({
        where: {
          name: {
            in: products,
          },
        },
        select: { id: true },
      });

      if (!languageId || !ratingId || productIds.length === 0) {
        return [];
      }

      // Find sales managers that match the criteria
      const salesManagers = await this.prisma.salesManager.findMany({
        where: {
          languages: {
            some: {
              languageId: languageId.id,
            },
          },
          customerRatings: {
            some: {
              customerRatingId: ratingId.id,
            },
          },
          products: {
            some: {
              productId: {
                in: productIds.map(p => p.id),
              },
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (salesManagers.length === 0) {
        return [];
      }

      const salesManagerIds = salesManagers.map(sm => sm.id);

      // Find available slots for these sales managers
      const availableSlots = await this.prisma.slot.findMany({
        where: {
          salesManagerId: {
            in: salesManagerIds,
          },
          booked: false,
          start_date: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          start_date: 'asc',
        },
      });

      // Check for overlapping booked slots
      const validSlots = await Promise.all(
        availableSlots.map(async (slot) => {
          const overlappingBookedSlot = await this.prisma.slot.findFirst({
            where: {
              salesManagerId: slot.salesManagerId,
              booked: true,
              start_date: {
                lt: slot.end_date,
              },
              end_date: {
                gt: slot.start_date,
              },
            },
          });
          return overlappingBookedSlot ? null : slot;
        })
      );

      // Group valid slots by start time
      const slotsByStartTime = validSlots
        .filter(Boolean)
        .reduce((acc, slot) => {
          const startTimeStr = slot.start_date.toISOString();
          if (!acc[startTimeStr]) {
            acc[startTimeStr] = {
              start_date: startTimeStr,
              slot_ids: [],
              available_count: 0,
            };
          }
          acc[startTimeStr].slot_ids.push(slot.id);
          acc[startTimeStr].available_count++;
          return acc;
        }, {} as Record<string, AvailableSlotDto>);

      const result = Object.values(slotsByStartTime);

      await this.cacheManager.set(cacheKey, result);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to query available slots, params: slots:${date}:${language}:${rating}:${products.join(',')}`,
        error,
      );
      throw new InternalServerErrorException();
    }
  }

  private async getCachedData(
    cacheKey: string,
  ): Promise<AvailableSlotDto[] | null> {
    try {
      const cachedData =
        await this.cacheManager.get<AvailableSlotDto[]>(cacheKey);

      if (cachedData) {
        return cachedData;
      }
    } catch (error) {
      this.logger.error(
        `Failed to retrieve cached data, params: ${cacheKey}`,
        error,
      );
      throw new InternalServerErrorException();
    }

    return null;
  }
}
