import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingEntity } from './entities/booking.entity';
import { Seat } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      include: {
        trip: { include: { route: true, vehicle: true } },
        seat: true,
        payments: true,
      },
    });
    return bookings.map((booking) => new BookingEntity(booking));
  }

  async create(
    userId: number,
    data: { tripId: number; seatId: number; paymentMethod: 'cash' | 'vietqr' },
  ): Promise<BookingEntity> {
    await this.releaseExpiredLocksAndBookings();

    const { tripId, seatId, paymentMethod } = data;

    const booking = await this.prisma.$transaction(async (tx) => {
      // 1. Get and lock the seat using FOR UPDATE to prevent double-booking
      const seats = await tx.$queryRaw<Seat[]>`
        SELECT * FROM seats WHERE id = ${seatId} FOR UPDATE
      `;
      if (seats.length === 0) {
        throw new NotFoundException(`Seat with ID ${seatId} not found`);
      }
      const seat = seats[0];

      // 2. Verify seat status
      if (seat.status === 'booked') {
        throw new BadRequestException('Ghế đã được đặt bởi khách khác');
      }

      // 3. Get the trip
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
      });
      if (!trip) {
        throw new NotFoundException(`Trip with ID ${tripId} not found`);
      }

      // 4. Generate unique ticket code
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const ticketCode = `TKT-${Date.now()}-${randomSuffix}`;

      // 5. Compute QR Data link
      let qrData = 'CASH_PAYMENT';
      if (paymentMethod === 'vietqr') {
        qrData = `https://img.vietqr.io/image/MB-0938671672-compact2.png?amount=${trip.price.toString()}&addInfo=${ticketCode}`;
      }

      // 6. Determine booking status (Hardcoded success for now)
      const bookingStatus = 'confirmed';

      // 7. Create booking
      const newBooking = await tx.booking.create({
        data: {
          userId,
          tripId,
          seatId,
          ticketCode,
          price: trip.price,
          status: bookingStatus,
          qrData,
        },
      });

      // 8. Create payment record (Hardcoded success for now)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration
      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          method: paymentMethod,
          gatewayRef: `REF-${newBooking.id}-${Date.now()}`,
          amount: trip.price,
          status: 'paid',
          expiresAt,
          paidAt: new Date(),
        },
      });

      // 9. Update seat status to booked
      await tx.seat.update({
        where: { id: seatId },
        data: {
          status: 'booked',
          bookingId: newBooking.id,
          lockedUntil: null,
        },
      });

      return newBooking;
    });

    const finalBooking = await this.prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        trip: { include: { route: true, vehicle: true } },
        seat: true,
        payments: true,
      },
    });

    return new BookingEntity(finalBooking);
  }

  async findOne(id: number): Promise<BookingEntity | null> {
    await this.releaseExpiredLocksAndBookings();
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    return booking ? new BookingEntity(booking) : null;
  }

  async releaseExpiredLocksAndBookings(): Promise<void> {
    const now = new Date();

    // 1. Release generic expired locks
    await this.prisma.seat.updateMany({
      where: {
        status: 'locked',
        lockedUntil: { lt: now },
      },
      data: {
        status: 'available',
        lockedUntil: null,
      },
    });

    // 2. Release unpaid bookings (15 minutes expiration)
    const expiredPayments = await this.prisma.payment.findMany({
      where: {
        status: 'pending',
        expiresAt: { lt: now },
      },
      include: {
        booking: true,
      },
    });

    for (const payment of expiredPayments) {
      try {
        await this.prisma.$transaction([
          this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'expired' },
          }),
          this.prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'cancelled' },
          }),
          this.prisma.seat.update({
            where: { id: payment.booking.seatId },
            data: {
              status: 'available',
              bookingId: null,
            },
          }),
        ]);
      } catch (err) {
        console.error('Error releasing expired booking:', err);
      }
    }
  }

  async myHistory(userId: number): Promise<BookingEntity[]> {
    await this.releaseExpiredLocksAndBookings();

    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        trip: {
          include: {
            route: true,
            vehicle: true,
          },
        },
        seat: true,
        payments: true,
      },
      orderBy: {
        bookedAt: 'desc',
      },
    });

    const now = new Date();

    return bookings.map((booking) => {
      const entity = new BookingEntity(booking);
      if (
        entity.status === 'confirmed' &&
        entity.trip &&
        new Date(entity.trip.departureAt) < now
      ) {
        entity.status = 'completed';
      }
      return entity;
    });
  }

  async cancelBooking(userId: number, id: number): Promise<BookingEntity> {
    await this.releaseExpiredLocksAndBookings();

    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { trip: true, seat: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.userId !== userId) {
      throw new BadRequestException(
        'You do not have permission to cancel this booking',
      );
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }

    const now = new Date();

    // Check 12 hours rule
    const hoursSinceBooking =
      (now.getTime() - new Date(booking.bookedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceBooking > 12) {
      throw new BadRequestException('Không thể hủy vé đã đặt quá 12 tiếng');
    }

    // Check departure rule
    if (new Date(booking.trip.departureAt) <= now) {
      throw new BadRequestException(
        'Cannot cancel a booking for a trip that has already departed',
      );
    }

    const updatedBooking = await this.prisma.$transaction(async (tx) => {
      // 1. Update booking status
      const updated = await tx.booking.update({
        where: { id },
        data: { status: 'cancelled' },
      });

      // 2. Cancel associated payments
      await tx.payment.updateMany({
        where: { bookingId: id, status: 'pending' },
        data: { status: 'cancelled' },
      });

      // 3. Make seat available again
      if (booking.seatId) {
        await tx.seat.update({
          where: { id: booking.seatId },
          data: {
            status: 'available',
            bookingId: null,
          },
        });
      }

      return updated;
    });

    const finalBooking = await this.prisma.booking.findUnique({
      where: { id: updatedBooking.id },
      include: {
        trip: { include: { route: true, vehicle: true } },
        seat: true,
        payments: true,
      },
    });

    return new BookingEntity(finalBooking);
  }
}
