/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn(),
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    seat: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    trip: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('myHistory', () => {
    it('should map status to completed if departure time is in the past', async () => {
      const mockBookings = [
        {
          id: 1,
          userId: 1,
          tripId: 2,
          seatId: 3,
          ticketCode: 'TKT-123',
          price: 150000,
          status: 'confirmed',
          qrData: 'qr',
          bookedAt: new Date(),
          trip: {
            id: 2,
            departureAt: new Date(Date.now() - 3600000), // 1 hour ago
            route: { origin: 'Hanoi', destination: 'Haiphong' },
            vehicle: { name: 'V1' },
          },
          seat: { seatNumber: 5 },
          payments: [],
        },
      ];

      (prisma.payment.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await service.myHistory(1);

      expect(result[0].status).toBe('completed');
    });

    it('should keep status confirmed if departure time is in the future', async () => {
      const mockBookings = [
        {
          id: 1,
          userId: 1,
          tripId: 2,
          seatId: 3,
          ticketCode: 'TKT-123',
          price: 150000,
          status: 'confirmed',
          qrData: 'qr',
          bookedAt: new Date(),
          trip: {
            id: 2,
            departureAt: new Date(Date.now() + 3600000), // 1 hour later
            route: { origin: 'Hanoi', destination: 'Haiphong' },
            vehicle: { name: 'V1' },
          },
          seat: { seatNumber: 5 },
          payments: [],
        },
      ];

      (prisma.payment.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await service.myHistory(1);

      expect(result[0].status).toBe('confirmed');
    });
  });

  describe('cancelBooking', () => {
    it('should fail to cancel if booking does not exist', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.cancelBooking(1, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should fail to cancel if booking was created more than 12 hours ago', async () => {
      const mockBooking = {
        id: 1,
        userId: 1,
        status: 'confirmed',
        bookedAt: new Date(Date.now() - 13 * 3600000), // 13 hours ago
        trip: { departureAt: new Date(Date.now() + 50000) },
      };

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      await expect(service.cancelBooking(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should cancel successfully within 12 hours and before departure', async () => {
      const mockBooking = {
        id: 1,
        userId: 1,
        status: 'confirmed',
        bookedAt: new Date(),
        trip: { departureAt: new Date(Date.now() + 50000) },
        seatId: 5,
      };

      (prisma.booking.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockBooking)
        .mockResolvedValueOnce({ ...mockBooking, status: 'cancelled' });
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          return await cb(prisma);
        },
      );
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: 'cancelled',
      });

      const result = await service.cancelBooking(1, 1);

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'cancelled' },
      });
      expect(prisma.seat.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { status: 'available', bookingId: null },
      });
      expect(result.status).toBe('cancelled');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if booking does not exist', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update(99, { status: 'confirmed' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update status and sync seat status successfully', async () => {
      const mockBooking = {
        id: 1,
        status: 'pending',
        seatId: 5,
      };

      (prisma.booking.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockBooking)
        .mockResolvedValueOnce({ ...mockBooking, status: 'confirmed' });

      (prisma.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          return await cb(prisma);
        },
      );

      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: 'confirmed',
      });

      const result = await service.update(1, { status: 'confirmed' });

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'confirmed' },
      });
      expect(prisma.seat.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { status: 'booked' },
      });
      expect(result.status).toBe('confirmed');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if booking does not exist', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('should remove booking and free seat', async () => {
      const mockBooking = {
        id: 1,
        seatId: 5,
      };

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          return await cb(prisma);
        },
      );

      await service.remove(1);

      expect(prisma.seat.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { status: 'available', bookingId: null },
      });
      expect(prisma.payment.deleteMany).toHaveBeenCalledWith({
        where: { bookingId: 1 },
      });
      expect(prisma.booking.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
