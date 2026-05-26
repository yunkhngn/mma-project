/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn(),
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    booking: {
      update: jest.fn(),
    },
    seat: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('confirmPayment', () => {
    it('should throw NotFoundException if payment does not exist', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.confirmPayment(99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if payment is not pending', async () => {
      const mockPayment = {
        id: 1,
        status: 'paid',
        bookingId: 2,
      };

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);

      await expect(service.confirmPayment(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should confirm payment successfully', async () => {
      const mockPayment = {
        id: 1,
        status: 'pending',
        bookingId: 2,
        booking: {
          id: 2,
          seatId: 3,
        },
      };

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          return await cb(prisma);
        },
      );
      (prisma.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: 'paid',
        paidAt: new Date(),
      });

      const result = await service.confirmPayment(1);

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'paid',
          paidAt: expect.any(Date) as Date,
        },
      });

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { status: 'confirmed' },
      });

      expect(prisma.seat.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { status: 'booked' },
      });

      expect(result.status).toBe('paid');
    });
  });
});
