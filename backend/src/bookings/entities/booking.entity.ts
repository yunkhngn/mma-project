import { Prisma } from '@prisma/client';
import { TripEntity } from '../../trips/entities/trip.entity';
import { SeatEntity } from '../../seats/entities/seat.entity';

export class BookingEntity {
  id: number;
  userId: number;
  tripId: number;
  seatId: number;
  ticketCode: string;
  price: Prisma.Decimal;
  status: string;
  qrData: string;
  bookedAt: Date;

  trip?: TripEntity;
  seat?: SeatEntity;
  payments?: any[];

  constructor(partial: Partial<BookingEntity>) {
    Object.assign(this, partial);
  }
}
