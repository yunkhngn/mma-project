/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  const mockPrisma = {
    booking: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should compile successfully', () => {
    expect(service).toBeDefined();
  });

  describe('getRevenueReport', () => {
    const mockBookings = [
      {
        id: 1,
        price: 150000,
        status: 'confirmed',
        bookedAt: new Date('2026-05-26T10:00:00.000Z'),
        trip: {
          routeId: 10,
          vehicleId: 20,
          route: { origin: 'Hanoi', destination: 'Haiphong' },
          vehicle: { name: 'V1' },
        },
      },
      {
        id: 2,
        price: 350000,
        status: 'confirmed',
        bookedAt: new Date('2026-05-27T12:00:00.000Z'),
        trip: {
          routeId: 10,
          vehicleId: 20,
          route: { origin: 'Hanoi', destination: 'Haiphong' },
          vehicle: { name: 'V1' },
        },
      },
      {
        id: 3,
        price: 200000,
        status: 'confirmed',
        bookedAt: new Date('2026-05-26T15:30:00.000Z'),
        trip: {
          routeId: 11,
          vehicleId: 21,
          route: { origin: 'Saigon', destination: 'Dalat' },
          vehicle: { name: 'V2' },
        },
      },
    ];

    it('should calculate total revenue and breakdown by route/date', async () => {
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await service.getRevenueReport({});

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: { status: 'confirmed' },
        include: {
          trip: {
            include: { route: true, vehicle: true },
          },
        },
      });

      expect(result.totalTicketsSold).toBe(3);
      expect(result.totalRevenue).toBe(700000);

      // Route breakdown
      expect(result.breakdownByRoute.length).toBe(2);
      const r10 = result.breakdownByRoute.find((r) => r.routeId === 10);
      expect(r10?.ticketsSold).toBe(2);
      expect(r10?.revenue).toBe(500000);

      // Date breakdown
      expect(result.breakdownByDate.length).toBe(2);
      const d26 = result.breakdownByDate.find((d) => d.date === '2026-05-26');
      expect(d26?.ticketsSold).toBe(2);
      expect(d26?.revenue).toBe(350000);
    });

    it('should query with date and entity filters correctly', async () => {
      (prisma.booking.findMany as jest.Mock).mockResolvedValue([]);

      await service.getRevenueReport({
        startDate: '2026-05-01',
        endDate: '2026-05-30',
        routeId: 10,
        vehicleId: 20,
      });

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          status: 'confirmed',
          bookedAt: {
            gte: new Date('2026-05-01T00:00:00.000Z'),
            lte: new Date('2026-05-30T23:59:59.999Z'),
          },
          trip: {
            routeId: 10,
            vehicleId: 20,
          },
        },
        include: {
          trip: {
            include: { route: true, vehicle: true },
          },
        },
      });
    });
  });
});
