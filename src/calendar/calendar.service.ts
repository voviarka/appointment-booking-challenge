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
      const response = await this.prisma.$queryRaw<AvailableSlotDto[]>(
        this.createSQLQuery(date, language, rating, products),
      );

      const result = response.map(
        ({ slot_ids, available_count, start_date }) => ({
          slot_ids,
          available_count: Number(available_count),
          start_date: new Date(start_date).toISOString(),
        }),
      );

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

  private createSQLQuery(
    date: string,
    language: Language,
    rating: Rating,
    products: Product[],
  ): Prisma.Sql {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    return Prisma.sql`
          SELECT ARRAY_AGG(s.id) AS slot_ids, 
                 s.start_date,
                 COUNT(*) AS available_count
          FROM slots s
                   JOIN sales_managers sm ON sm.id = s.sales_manager_id
          WHERE s.booked = FALSE
            AND s.start_date >= ${startDate}
            AND s.start_date < ${endDate}
            AND sm.languages && ${[language]}::VARCHAR[]
            AND sm.customer_ratings && ${[rating]}::VARCHAR[]
            AND sm.products @> ${products}::VARCHAR[]
            AND NOT EXISTS (
              SELECT 1
              FROM slots s_overlap
              WHERE s_overlap.sales_manager_id = s.sales_manager_id
                AND s_overlap.booked = TRUE
                AND s_overlap.start_date < s.end_date
                AND s_overlap.end_date > s.start_date
            )
          GROUP BY s.start_date
          ORDER BY s.start_date;    
    `;
  }
}
