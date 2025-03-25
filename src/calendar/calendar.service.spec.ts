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

  const mockLanguageId = { id: 1 };
  const mockRatingId = { id: 1 };
  const mockProductIds = [{ id: 1 }, { id: 2 }];
  const mockSalesManagers = [{ id: 1 }, { id: 2 }];
  
  const mockAvailableSlots = [
    {
      id: 1,
      start_date: new Date('2024-05-03T10:00:00Z'),
      end_date: new Date('2024-05-03T11:00:00Z'),
      booked: false,
      salesManagerId: 1
    },
    {
      id: 2,
      start_date: new Date('2024-05-03T10:00:00Z'),
      end_date: new Date('2024-05-03T11:00:00Z'),
      booked: false,
      salesManagerId: 2
    },
    {
      id: 3,
      start_date: new Date('2024-05-03T11:00:00Z'),
      end_date: new Date('2024-05-03T12:00:00Z'),
      booked: false,
      salesManagerId: 1
    }
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
            language: {
              findUnique: jest.fn(),
            },
            customerRating: {
              findUnique: jest.fn(),
            },
            product: {
              findMany: jest.fn(),
            },
            salesManager: {
              findMany: jest.fn(),
            },
            slot: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
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
          slot_ids: [1, 2],
          available_count: 2,
          start_date: '2024-05-03T10:00:00.000Z',
        },
      ];

      cacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.queryAvailableSlots(mockQuerySlotsDto);

      expect(result).toEqual(cachedResult);
      expect(cacheManager.get).toHaveBeenCalledWith(
        'slots:2024-05-03:German:Gold:SolarPanels,Heatpumps',
      );
      expect(prismaService.language.findUnique).not.toHaveBeenCalled();
    });

    it('should query database and cache results if cache is empty', async () => {
      cacheManager.get.mockResolvedValue(null);
      
      // Mock database queries
      prismaService.language.findUnique = jest.fn().mockResolvedValue(mockLanguageId);
      prismaService.customerRating.findUnique = jest.fn().mockResolvedValue(mockRatingId);
      prismaService.product.findMany = jest.fn().mockResolvedValue(mockProductIds);
      prismaService.salesManager.findMany = jest.fn().mockResolvedValue(mockSalesManagers);
      prismaService.slot.findMany = jest.fn().mockResolvedValue(mockAvailableSlots);
      prismaService.slot.findFirst = jest.fn().mockResolvedValue(null); // No overlapping booked slots

      const result = await service.queryAvailableSlots(mockQuerySlotsDto);

      const expectedResult = [
        {
          slot_ids: [1, 2],
          available_count: 2,
          start_date: '2024-05-03T10:00:00.000Z',
        },
        {
          slot_ids: [3],
          available_count: 1,
          start_date: '2024-05-03T11:00:00.000Z',
        },
      ];

      expect(result).toEqual(expectedResult);
      expect(prismaService.language.findUnique).toHaveBeenCalledWith({
        where: { name: 'German' },
        select: { id: true },
      });
      expect(prismaService.customerRating.findUnique).toHaveBeenCalledWith({
        where: { name: 'Gold' },
        select: { id: true },
      });
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { name: { in: ['SolarPanels', 'Heatpumps'] } },
        select: { id: true },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        `slots:2024-05-03:German:Gold:SolarPanels,Heatpumps`,
        expectedResult,
      );
    });

    it('should throw InternalServerErrorException when database query fails', async () => {
      const serverError = new Error('Database error');
      const loggerSpy = jest.spyOn(service['logger'], 'error');
      cacheManager.get.mockResolvedValue(null);
      prismaService.language.findUnique = jest.fn().mockRejectedValue(serverError);

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

    it('should return empty array if no matching resources found', async () => {
      cacheManager.get.mockResolvedValue(null);
      
      // No matching language
      prismaService.language.findUnique = jest.fn().mockResolvedValue(null);
      
      const result = await service.queryAvailableSlots(mockQuerySlotsDto);
      
      expect(result).toEqual([]);
    });
  });
});
