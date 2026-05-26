/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TripsService', () => {
  let service: TripsService;
  let prisma: PrismaService;

  const mockPrisma = {
    trip: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    route: {
      findUnique: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
    },
    seat: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchTrips', () => {
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

      (prisma.trip.findMany as jest.Mock).mockResolvedValue([mockTrip]);

      const result = await service.searchTrips(
        'Hanoi',
        'Haiphong',
        '2026-05-26',
      );

      expect(prisma.trip.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('create', () => {
    it('should throw NotFoundException if route does not exist', async () => {
      (prisma.route.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create({
          routeId: 99,
          vehicleId: 1,
          departureAt: new Date(),
          price: 10000,
          licensePlate: '123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      (prisma.route.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create({
          routeId: 1,
          vehicleId: 99,
          departureAt: new Date(),
          price: 10000,
          licensePlate: '123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create trip successfully', async () => {
      (prisma.route.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 2 });

      const mockCreated = {
        id: 10,
        routeId: 1,
        vehicleId: 2,
        departureAt: new Date('2026-05-27T08:00:00.000Z'),
        price: 150000,
        licensePlate: '29A-12345',
        status: 'active',
        route: { origin: 'HN', destination: 'HP' },
        vehicle: { name: 'V1' },
      };
      (prisma.trip.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await service.create({
        routeId: 1,
        vehicleId: 2,
        departureAt: '2026-05-27T08:00:00.000Z',
        price: 150000,
        licensePlate: '29A-12345',
      });

      expect(prisma.trip.create).toHaveBeenCalled();
      expect(result.id).toBe(10);
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if trip has active bookings', async () => {
      const mockTrip = {
        id: 1,
        _count: { bookings: 2 },
      };

      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should delete trip and related seats successfully', async () => {
      const mockTrip = {
        id: 1,
        _count: { bookings: 0 },
        route: { origin: 'HN', destination: 'HP' },
        vehicle: { name: 'V1' },
      };

      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);
      (prisma.trip.delete as jest.Mock).mockResolvedValue(mockTrip);

      const result = await service.remove(1);

      expect(prisma.seat.deleteMany).toHaveBeenCalledWith({
        where: { tripId: 1 },
      });
      expect(prisma.trip.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { route: true, vehicle: true },
      });
      expect(result.id).toBe(1);
    });
  });
});
