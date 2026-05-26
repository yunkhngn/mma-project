import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TripEntity } from './entities/trip.entity';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<TripEntity[]> {
    const trips = await this.prisma.trip.findMany();
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
}
