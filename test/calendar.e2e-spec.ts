import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { AvailableSlotDto } from '../src/calendar/dto/available-slot.dto';
import { CalendarService } from '../src/calendar/calendar.service';

const setupTestApp = async (
  shouldOverrideCalendarService = false,
): Promise<INestApplication> => {
  const moduleFixture = Test.createTestingModule({
    imports: [AppModule],
  });

  if (shouldOverrideCalendarService) {
    moduleFixture.overrideProvider(CalendarService).useValue({
      $queryRaw: async () => Promise.reject(new Error('Internal server error')),
    });
  }

  const compiledModule = await moduleFixture.compile();
  const app = compiledModule.createNestApplication();
  await app.init();
  return app;
};

describe('Calendar (e2e)', () => {
  const correctRequestBody = {
    rating: 'Silver',
    date: '2024-05-04',
    language: 'English',
    products: ['Heatpumps'],
  };

  describe('POST /calendar/query', () => {
    let app: INestApplication;

    beforeAll(async () => {
      app = await setupTestApp();
    });

    afterAll(async () => {
      await app.close();
    });

    it('should return calendar availability', async () => {
      const response = await request(app.getHttpServer())
        .post('/calendar/query')
        .send(correctRequestBody)
        .expect(200);

      const body = response.body as AvailableSlotDto[];
      const firstSlot = body[0];

      expect(body).toHaveLength(1);
      expect(firstSlot).toMatchObject({
        available_count: 1,
        start_date: '2024-05-04T11:30:00.000Z',
      });
    });

    it('should return 400 for invalid request and error message', async () => {
      const invalidRequestBody = {
        ...correctRequestBody,
        rating: 'Brilliant',
      };

      const response = await request(app.getHttpServer())
        .post('/calendar/query')
        .send(invalidRequestBody)
        .expect(400);

      expect((response.body as { message: string[] }).message).toHaveLength(1);
      expect((response.body as { message: string[] }).message[0]).toBe(
        'Rating must be Bronze, Silver, Gold',
      );
    });
  });

  describe('POST /calendar/query 500 error', () => {
    let app: INestApplication;

    beforeAll(async () => {
      app = await setupTestApp(true);
    });

    afterAll(async () => {
      await app.close();
    });

    it('should return 500 error message', async () => {
      const response = await request(app.getHttpServer())
        .post('/calendar/query')
        .send(correctRequestBody)
        .expect(500);

      expect((response.body as { message: string }).message).toBe(
        'Internal server error',
      );
    });
  });
});
