/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TripsService', () => {
  let service: TripsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        {
          provide: PrismaService,
          useValue: {
            trip: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should search trips matching route and departure date range', async () => {
    const mockTrip = {
      id: 1,
      routeId: 2,
      vehicleId: 3,
      departureAt: new Date('2026-05-26T10:00:00.000Z'),
      price: 150000,
      licensePlate: '29A-12345',
      status: 'active',
      route: {
        id: 2,
        origin: 'Hanoi',
        destination: 'Haiphong',
      },
      vehicle: {
        id: 3,
        name: 'Limousine 9s',
        totalSeats: 9,
      },
    };

    const findManyMock = prisma.trip.findMany as jest.Mock;
    findManyMock.mockResolvedValue([mockTrip]);

    const result = await service.searchTrips('Hanoi', 'Haiphong', '2026-05-26');

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        departureAt: {
          gte: new Date('2026-05-26T00:00:00.000Z'),
          lte: new Date('2026-05-26T23:59:59.999Z'),
        },
        route: {
          origin: { contains: 'Hanoi' },
          destination: { contains: 'Haiphong' },
        },
      },
      include: {
        route: true,
        vehicle: true,
      },
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
    expect(result[0].route?.origin).toBe('Hanoi');
  });
});
