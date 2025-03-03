import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestingApp } from './test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testApp = await createTestingApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/healthcheck (GET)', () => {
    return request(app.getHttpServer())
      .get('/healthcheck')
      .expect(200)
      .expect('healthy');
  });
});
