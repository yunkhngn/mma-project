import { Prisma } from '@prisma/client';

export class TripEntity {
  id: number;
  routeId: number;
  vehicleId: number;
  departureAt: Date;
  price: Prisma.Decimal;
  licensePlate: string;
  status: string;

  constructor(partial: Partial<TripEntity>) {
    Object.assign(this, partial);
  }
}
