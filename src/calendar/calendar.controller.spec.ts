import { Test, TestingModule } from '@nestjs/testing';

import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { AvailableSlotDto } from './dto/available-slot.dto';
import { QuerySlotsFactory } from './dto/query-slots.factory';

describe('CalendarController', () => {
  let controller: CalendarController;

  const mockCalendarService = {
    queryAvailableSlots: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [
        {
          provide: CalendarService,
          useValue: mockCalendarService,
        },
      ],
    }).compile();

    controller = module.get<CalendarController>(CalendarController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('queryAvailableSlots', () => {
    it('should return available slots', async () => {
      const queryDto = QuerySlotsFactory.createValid();

      const expectedResult: AvailableSlotDto[] = [
        {
          slot_ids: [1, 2],
          available_count: 2,
          start_date: '2024-03-20T09:00:00Z',
        },
      ];

      mockCalendarService.queryAvailableSlots.mockResolvedValue(expectedResult);

      const result = await controller.queryAvailableSlots(queryDto);

      expect(mockCalendarService.queryAvailableSlots).toHaveBeenCalledWith(
        queryDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
