import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InternalServerErrorException } from '@nestjs/common';

import { CalendarService } from './calendar.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { QuerySlotsFactory } from './dto/query-slots.factory';

describe('CalendarService', () => {
  let service: CalendarService;
  let prismaService: PrismaService;
  let cacheManager: {
    get: jest.Mock<Promise<any>, [string]>;
    set: jest.Mock<Promise<void>, [string, any]>;
  };

  const mockQuerySlotsDto = QuerySlotsFactory.createValid();

  const mockAvailableSlots = [
    {
      slot_id: 1,
      available_count: 2,
      start_date: '2024-05-03T10:00:00Z',
    },
    {
      slot_id: 2,
      available_count: 1,
      start_date: '2024-05-03T11:00:00Z',
    },
  ];

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn<Promise<any>, [string]>(),
      set: jest.fn<Promise<void>, [string, any]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queryAvailableSlots', () => {
    it('should return cached data if available', async () => {
      const cachedResult = [
        {
          available_count: 2,
          start_date: '2024-05-03T10:00:00.000Z',
        },
      ];

      cacheManager.get.mockResolvedValue(cachedResult);
      const queryRawSpy = jest.spyOn(prismaService, '$queryRaw');

      const result = await service.queryAvailableSlots(mockQuerySlotsDto);

      expect(result).toEqual(cachedResult);
      expect(cacheManager.get).toHaveBeenCalledWith(
        'slots:2024-05-03:German:Gold:SolarPanels,Heatpumps',
      );
      expect(queryRawSpy).not.toHaveBeenCalled();
    });

    it('should query database and cache results if cache is empty', async () => {
      cacheManager.get.mockResolvedValue(null);
      const queryRawSpy = jest
        .spyOn(prismaService, '$queryRaw')
        .mockResolvedValue(mockAvailableSlots);

      const result = await service.queryAvailableSlots(mockQuerySlotsDto);

      const expectedResult = [
        {
          available_count: 2,
          start_date: '2024-05-03T10:00:00.000Z',
        },
        {
          available_count: 1,
          start_date: '2024-05-03T11:00:00.000Z',
        },
      ];

      expect(result).toEqual(expectedResult);
      expect(queryRawSpy).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        `slots:2024-05-03:German:Gold:SolarPanels,Heatpumps`,
        expectedResult,
      );
    });

    it('should throw InternalServerErrorException when database query fails', async () => {
      const serverError = new Error('Database error');
      const loggerSpy = jest.spyOn(service['logger'], 'error');
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(serverError);

      await expect(
        service.queryAvailableSlots(mockQuerySlotsDto),
      ).rejects.toThrow(InternalServerErrorException);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to query available slots, params: slots:2024-05-03:German:Gold:SolarPanels,Heatpumps',
        serverError,
      );
    });

    it('should log error message when cache retrieval fails', async () => {
      const cacheError = new Error('Cache error');
      cacheManager.get.mockRejectedValue(cacheError);

      const loggerSpy = jest.spyOn(service['logger'], 'error');

      await expect(
        service.queryAvailableSlots(mockQuerySlotsDto),
      ).rejects.toThrow(InternalServerErrorException);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to retrieve cached data, params: slots:2024-05-03:German:Gold:SolarPanels,Heatpumps',
        cacheError,
      );
    });
  });
});
