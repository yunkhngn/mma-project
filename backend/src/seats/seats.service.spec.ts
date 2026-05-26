/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SeatsService } from './seats.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from '../bookings/bookings.service';
import { BadRequestException } from '@nestjs/common';

describe('SeatsService', () => {
  let service: SeatsService;
  let prisma: PrismaService;

  const mockPrisma = {
    seat: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    trip: {
      findUnique: jest.fn(),
    },
  };

  const mockBookingsService = {
    releaseExpiredLocksAndBookings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    service = module.get<SeatsService>(SeatsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOrCreateSeatsForTrip', () => {
    it('should auto-populate seats if none exist', async () => {
      const mockTrip = {
        id: 1,
        vehicle: {
          totalSeats: 3,
          seatLayout: { rows: 1, cols: 3 },
        },
      };

      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);
      (prisma.seat.findMany as jest.Mock)
        .mockResolvedValueOnce([]) // First check: empty
        .mockResolvedValueOnce([
          { id: 1, seatNumber: 1, status: 'available' },
          { id: 2, seatNumber: 2, status: 'available' },
          { id: 3, seatNumber: 3, status: 'available' },
        ]); // Second check: populated

      const result = await service.findOrCreateSeatsForTrip(1);

      expect(prisma.seat.createMany).toHaveBeenCalledWith({
        data: [
          { tripId: 1, seatNumber: 1, status: 'available' },
          { tripId: 1, seatNumber: 2, status: 'available' },
          { tripId: 1, seatNumber: 3, status: 'available' },
        ],
      });
      expect(result.seats.length).toBe(3);
      expect(result.seatLayout).toEqual({ rows: 1, cols: 3 });
    });
  });

  describe('lockSeat', () => {
    it('should fail if seat is already booked', async () => {
      const mockSeat = {
        id: 1,
        tripId: 1,
        seatNumber: 1,
        status: 'booked',
      };

      (prisma.seat.findFirst as jest.Mock).mockResolvedValue(mockSeat);

      await expect(service.lockSeat(1, 1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully lock seat if available', async () => {
      const mockSeat = {
        id: 1,
        tripId: 1,
        seatNumber: 1,
        status: 'available',
      };

      (prisma.seat.findFirst as jest.Mock).mockResolvedValue(mockSeat);
      (prisma.seat.update as jest.Mock).mockResolvedValue({
        ...mockSeat,
        status: 'locked',
        lockedUntil: new Date(),
      });

      const result = await service.lockSeat(1, 1, 1);

      expect(prisma.seat.update).toHaveBeenCalled();
      expect(result.status).toBe('locked');
    });
  });
});
