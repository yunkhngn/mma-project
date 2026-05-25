import { Prisma } from '@prisma/client';

export class PaymentEntity {
  id: number;
  bookingId: number;
  method: string;
  gatewayRef: string;
  amount: Prisma.Decimal;
  status: string;
  paidAt: Date | null;
  expiresAt: Date | null;

  constructor(partial: Partial<PaymentEntity>) {
    Object.assign(this, partial);
  }
}
