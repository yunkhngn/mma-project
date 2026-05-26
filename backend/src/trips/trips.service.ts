import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TripEntity } from './entities/trip.entity';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<TripEntity[]> {
    const trips = await this.prisma.trip.findMany({
      include: { route: true, vehicle: true },
    });
    return trips.map((trip) => new TripEntity(trip));
  }

  async findOne(id: number): Promise<TripEntity | null> {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { route: true, vehicle: true },
    });
    return trip ? new TripEntity(trip) : null;
  }

  async searchTrips(
    origin: string,
    destination: string,
    departureDate: string,
  ): Promise<TripEntity[]> {
    const startOfDay = new Date(`${departureDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${departureDate}T23:59:59.999Z`);

    const trips = await this.prisma.trip.findMany({
      where: {
        departureAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        route: {
          origin: {
            contains: origin,
          },
          destination: {
            contains: destination,
          },
        },
      },
      include: {
        route: true,
        vehicle: true,
      },
    });

    return trips.map((trip) => new TripEntity(trip));
  }

  async create(data: {
    routeId: number;
    vehicleId: number;
    departureAt: string | Date;
    price: number;
    licensePlate: string;
    status?: string;
  }): Promise<TripEntity> {
    const route = await this.prisma.route.findUnique({
      where: { id: data.routeId },
    });
    if (!route) {
      throw new NotFoundException(`Route with ID ${data.routeId} not found`);
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException(
        `Vehicle with ID ${data.vehicleId} not found`,
      );
    }

    const trip = await this.prisma.trip.create({
      data: {
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        departureAt: new Date(data.departureAt),
        price: data.price,
        licensePlate: data.licensePlate,
        status: data.status || 'active',
      },
      include: { route: true, vehicle: true },
    });

    return new TripEntity(trip);
  }

  async update(
    id: number,
    data: {
      routeId?: number;
      vehicleId?: number;
      departureAt?: string | Date;
      price?: number;
      licensePlate?: string;
      status?: string;
    },
  ): Promise<TripEntity> {
    const existing = await this.prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    if (data.routeId) {
      const route = await this.prisma.route.findUnique({
        where: { id: data.routeId },
      });
      if (!route) {
        throw new NotFoundException(`Route with ID ${data.routeId} not found`);
      }
    }

    if (data.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: data.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException(
          `Vehicle with ID ${data.vehicleId} not found`,
        );
      }
    }

    const trip = await this.prisma.trip.update({
      where: { id },
      data: {
        ...data,
        departureAt: data.departureAt ? new Date(data.departureAt) : undefined,
      },
      include: { route: true, vehicle: true },
    });

    return new TripEntity(trip);
  }

  async remove(id: number): Promise<TripEntity> {
    const existing = await this.prisma.trip.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    if (existing._count.bookings > 0) {
      throw new BadRequestException(
        'Cannot delete trip as it has associated bookings',
      );
    }

    await this.prisma.seat.deleteMany({ where: { tripId: id } });

    const trip = await this.prisma.trip.delete({
      where: { id },
      include: { route: true, vehicle: true },
    });
    return new TripEntity(trip);
  }
}
