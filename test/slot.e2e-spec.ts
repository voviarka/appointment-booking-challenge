import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { BookedSlotDto } from '../src/slot/dto/booked-slot.dto';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { createTestingApp } from './test-utils';

describe('Slot (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const testApp = await createTestingApp();
    app = testApp.app;
    prismaService = testApp.prismaService;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /slots/bookings', () => {
    const validRequestBody = {
      slotIds: [1, 2, 3],
      userId: 3
    };

    // Mock data for a booked slot
    const mockBookedSlot = {
      id: 1,
      sales_manager_id: 104,
      start_date: new Date('2024-05-03T10:30:00.000Z'),
      end_date: new Date('2024-05-03T11:00:00.000Z'),
      user_id: 3,
      booked: true
    };

    beforeEach(async () => {
      // Reset the database state or mock as needed
      jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
        return callback(prismaService);
      });

      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValue([{ id: 1 }]);
      jest.spyOn(prismaService.slot, 'update').mockResolvedValue(mockBookedSlot);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully book a slot', async () => {
      const response = await request(app.getHttpServer())
        .post('/slots/bookings')
        .send(validRequestBody)
        .expect(200);

      const bookedSlot = response.body as BookedSlotDto;
      
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.$queryRawUnsafe).toHaveBeenCalled();
      expect(prismaService.slot.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          booked: true,
          user_id: 3
        }
      });

      expect(bookedSlot).toMatchObject({
        id: 1,
        sales_manager_id: 104,
        user_id: 3,
        booked: true
      });
      expect(new Date(bookedSlot.start_date)).toBeInstanceOf(Date);
      expect(new Date(bookedSlot.end_date)).toBeInstanceOf(Date);
    });

    it('should return 400 for invalid request body', async () => {
      const invalidRequestBody = {
        slotIds: 'not-an-array', // Invalid type
        userId: 3
      };

      const response = await request(app.getHttpServer())
        .post('/slots/bookings')
        .send(invalidRequestBody)
        .expect(400);

      expect(response.body.message).toContain('slotIds');
    });

    it('should return 404 when no slots are available', async () => {
      // Mock no available slots
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .post('/slots/bookings')
        .send(validRequestBody)
        .expect(404);

      expect(response.body.message).toBe('No available slots found');
    });

    it('should handle database errors gracefully', async () => {
      // Mock a database error
      jest.spyOn(prismaService, '$transaction').mockRejectedValue(new Error('Database error'));

      const response = await request(app.getHttpServer())
        .post('/slots/bookings')
        .send(validRequestBody)
        .expect(400);

      expect(response.body.message).toBe('Database error');
    });
  });
});