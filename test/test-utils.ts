import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

export async function createTestingApp(): Promise<{
  app: INestApplication;
  prismaService: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const prismaService = app.get<PrismaService>(PrismaService);
  
  await app.init();
  
  return { app, prismaService };
} 