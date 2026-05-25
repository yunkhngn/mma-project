import { Prisma } from '@prisma/client';

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

  constructor(partial: Partial<BookingEntity>) {
    Object.assign(this, partial);
  }
}
