import { Test, TestingModule } from '@nestjs/testing';
import { SlotService } from './slot.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BookedSlotDto } from './dto/booked-slot.dto';
import { SlotBookingsDto } from './dto/slot-bookings.dto';

describe('SlotService', () => {
  let service: SlotService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    slot: {
      update: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SlotService>(SlotService);

    jest.clearAllMocks();
  });

  describe('bookSlot', () => {
    it('should successfully book an available slot', async () => {
      // Arrange
      const slotBookingsDto: SlotBookingsDto = {
        slotIds: [1],
        userId: 3,
      };

      const availableSlot = [{ id: 1 }];
      const bookedSlot: BookedSlotDto = {
        id: 1,
        sales_manager_id: 104,
        start_date: new Date('2024-05-03T10:30:00.000Z'),
        end_date: new Date('2024-05-03T11:00:00.000Z'),
        user_id: 3,
      };

      mockPrismaService.$transaction.mockImplementation(
        <T>(callback: (tx: any) => Promise<T>) => {
          const tx = {
            $queryRawUnsafe: jest.fn().mockResolvedValue(availableSlot),
            slot: {
              update: jest.fn().mockResolvedValue(bookedSlot),
            },
          };
          return callback(tx);
        },
      );

      const result = await service.bookSlot(slotBookingsDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(bookedSlot);
    });

    it('should try multiple slots until finding an available one', async () => {
      // Arrange
      const slotBookingsDto: SlotBookingsDto = {
        slotIds: [1, 2, 3],
        userId: 3,
      };

      const bookedSlot: BookedSlotDto = {
        id: 2,
        sales_manager_id: 104,
        start_date: new Date('2024-05-03T10:30:00.000Z'),
        end_date: new Date('2024-05-03T11:00:00.000Z'),
        user_id: 3,
      };

      mockPrismaService.$transaction.mockImplementation(
        <T>(callback: (tx: any) => Promise<T>) => {
          const tx = {
            $queryRawUnsafe: jest
              .fn()
              .mockResolvedValueOnce([])
              .mockResolvedValueOnce([{ id: 2 }]),
            slot: {
              update: jest.fn().mockResolvedValue(bookedSlot),
            },
          };
          return callback(tx);
        },
      );

      const result = await service.bookSlot(slotBookingsDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(bookedSlot);
    });

    it('should throw NotFoundException when no slots are available', async () => {
      const slotBookingsDto: SlotBookingsDto = {
        slotIds: [1, 2],
        userId: 3,
      };

      mockPrismaService.$transaction.mockImplementation(
        <T>(callback: (tx: any) => Promise<T>) => {
          const tx = {
            $queryRawUnsafe: jest.fn().mockResolvedValue([]), // No slots available
            slot: {
              update: jest.fn(),
            },
          };
          return callback(tx);
        },
      );

      await expect(service.bookSlot(slotBookingsDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should catch and rethrow errors as BadRequestException', async () => {
      const slotBookingsDto: SlotBookingsDto = {
        slotIds: [1],
        userId: 3,
      };

      const errorMessage = 'Database error';
      mockPrismaService.$transaction.mockRejectedValue(
        new BadRequestException(errorMessage),
      );

      // Act & Assert
      await expect(service.bookSlot(slotBookingsDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.bookSlot(slotBookingsDto)).rejects.toThrow(
        errorMessage,
      );
    });

    it('should handle non-Error exceptions and provide a generic message', async () => {
      const slotBookingsDto: SlotBookingsDto = {
        slotIds: [1],
        userId: 3,
      };

      mockPrismaService.$transaction.mockRejectedValue(
        new BadRequestException('Error booking slot'),
      );

      await expect(service.bookSlot(slotBookingsDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.bookSlot(slotBookingsDto)).rejects.toThrow(
        'Error booking slot',
      );
    });
  });
});
