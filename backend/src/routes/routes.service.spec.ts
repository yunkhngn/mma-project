/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RoutesService', () => {
  let service: RoutesService;
  let prisma: PrismaService;

  const mockPrisma = {
    route: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a route', async () => {
      const routeData = {
        origin: 'Hanoi',
        destination: 'Haiphong',
        distanceKm: 120,
      };

      const mockCreated = { id: 1, ...routeData };
      (prisma.route.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await service.create(routeData);

      expect(prisma.route.create).toHaveBeenCalledWith({ data: routeData });
      expect(result.id).toBe(1);
      expect(result.origin).toBe('Hanoi');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if route does not exist', async () => {
      (prisma.route.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update(99, { origin: 'Da Nang' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update successfully if route exists', async () => {
      const mockRoute = {
        id: 1,
        origin: 'Hanoi',
        destination: 'Haiphong',
        distanceKm: 120,
      };

      (prisma.route.findUnique as jest.Mock).mockResolvedValue(mockRoute);
      (prisma.route.update as jest.Mock).mockResolvedValue({
        ...mockRoute,
        origin: 'Da Nang',
      });

      const result = await service.update(1, { origin: 'Da Nang' });

      expect(prisma.route.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { origin: 'Da Nang' },
      });
      expect(result.origin).toBe('Da Nang');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if route does not exist', async () => {
      (prisma.route.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if route has active trips', async () => {
      const mockRoute = {
        id: 1,
        origin: 'Hanoi',
        destination: 'Haiphong',
        distanceKm: 120,
        _count: { trips: 2 },
      };

      (prisma.route.findUnique as jest.Mock).mockResolvedValue(mockRoute);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should delete route successfully if no trips associated', async () => {
      const mockRoute = {
        id: 1,
        origin: 'Hanoi',
        destination: 'Haiphong',
        distanceKm: 120,
        _count: { trips: 0 },
      };

      (prisma.route.findUnique as jest.Mock).mockResolvedValue(mockRoute);
      (prisma.route.delete as jest.Mock).mockResolvedValue(mockRoute);

      const result = await service.remove(1);

      expect(prisma.route.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result.id).toBe(1);
    });
  });
});
