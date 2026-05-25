import { Injectable } from '@nestjs/common';
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
}
