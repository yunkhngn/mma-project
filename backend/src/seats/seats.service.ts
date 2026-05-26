import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeatEntity } from './entities/seat.entity';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class SeatsService {
  constructor(
    private prisma: PrismaService,
    private bookingsService: BookingsService,
  ) {}

  async findAll(): Promise<SeatEntity[]> {
    const seats = await this.prisma.seat.findMany();
    return seats.map((seat) => new SeatEntity(seat));
  }

  async findOne(id: number): Promise<SeatEntity | null> {
    const seat = await this.prisma.seat.findUnique({ where: { id } });
    return seat ? new SeatEntity(seat) : null;
  }

  async findOrCreateSeatsForTrip(tripId: number): Promise<{
    seats: SeatEntity[];
    seatLayout: any;
  }> {
    await this.bookingsService.releaseExpiredLocksAndBookings();

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }

    let seats = await this.prisma.seat.findMany({
      where: { tripId },
    });

    if (seats.length === 0) {
      const seatsData: {
        tripId: number;
        seatNumber: number;
        status: string;
      }[] = [];
      for (let i = 1; i <= trip.vehicle.totalSeats; i++) {
        seatsData.push({
          tripId,
          seatNumber: i,
          status: 'available',
        });
      }
      await this.prisma.seat.createMany({ data: seatsData });

      seats = await this.prisma.seat.findMany({
        where: { tripId },
      });
    }

    return {
      seats: seats.map((s) => new SeatEntity(s)),
      seatLayout: trip.vehicle.seatLayout,
    };
  }

  async lockSeat(
    userId: number,
    tripId: number,
    seatNumber: number,
  ): Promise<SeatEntity> {
    await this.bookingsService.releaseExpiredLocksAndBookings();

    const seat = await this.prisma.seat.findFirst({
      where: {
        tripId,
        seatNumber,
      },
    });

    if (!seat) {
      throw new NotFoundException(
        `Seat number ${seatNumber} for trip ${tripId} not found`,
      );
    }

    if (seat.status === 'booked') {
      throw new BadRequestException('Seat is already booked');
    }

    if (seat.status === 'locked') {
      const now = new Date();
      if (seat.lockedUntil && seat.lockedUntil > now) {
        throw new BadRequestException(
          'Seat is currently locked by another user',
        );
      }
    }

    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const updatedSeat = await this.prisma.seat.update({
      where: { id: seat.id },
      data: {
        status: 'locked',
        lockedUntil,
      },
    });

    return new SeatEntity(updatedSeat);
  }
}
