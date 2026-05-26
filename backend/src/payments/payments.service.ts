import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentEntity } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany();
    return payments.map((payment) => new PaymentEntity(payment));
  }

  async findOne(id: number): Promise<PaymentEntity | null> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    return payment ? new PaymentEntity(payment) : null;
  }

  async confirmPayment(id: number): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status !== 'pending') {
      throw new BadRequestException(
        `Payment status is already ${payment.status}`,
      );
    }

    const updatedPayment = await this.prisma.$transaction(async (tx) => {
      // 1. Update Payment status to paid
      const updated = await tx.payment.update({
        where: { id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      });

      // 2. Update Booking status to confirmed
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'confirmed',
        },
      });

      // 3. Update associated Seat status to booked
      await tx.seat.update({
        where: { id: payment.booking.seatId },
        data: {
          status: 'booked',
        },
      });

      return updated;
    });

    return new PaymentEntity(updatedPayment);
  }
}
