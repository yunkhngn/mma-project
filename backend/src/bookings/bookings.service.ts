import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingEntity } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany();
    return bookings.map((booking) => new BookingEntity(booking));
  }

  async findOne(id: number): Promise<BookingEntity | null> {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    return booking ? new BookingEntity(booking) : null;
  }
}
