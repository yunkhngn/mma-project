import { Prisma } from '@prisma/client';

export class VehicleEntity {
  id: number;
  name: string;
  totalSeats: number;
  type: string;
  seatLayout: Prisma.JsonValue;

  constructor(partial: Partial<VehicleEntity>) {
    Object.assign(this, partial);
  }
}
