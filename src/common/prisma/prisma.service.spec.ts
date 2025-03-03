import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to the database', async () => {
      const connectSpy = jest.spyOn(service, '$connect');

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });

    it('should throw an error if connection fails', async () => {
      jest
        .spyOn(service, '$connect')
        .mockRejectedValueOnce(new Error('Connection failed'));

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from the database', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect');

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should throw an error if disconnection fails', async () => {
      jest
        .spyOn(service, '$disconnect')
        .mockRejectedValueOnce(new Error('Disconnection failed'));

      await expect(service.onModuleDestroy()).rejects.toThrow(
        'Disconnection failed',
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
