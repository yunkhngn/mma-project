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
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    return trip ? new TripEntity(trip) : null;
  }
}
