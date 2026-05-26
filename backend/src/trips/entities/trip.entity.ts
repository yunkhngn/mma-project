import { Prisma } from '@prisma/client';
import { RouteEntity } from '../../routes/entities/route.entity';
import { VehicleEntity } from '../../vehicles/entities/vehicle.entity';

export class TripEntity {
  id: number;
  routeId: number;
  vehicleId: number;
  departureAt: Date;
  price: Prisma.Decimal;
  licensePlate: string;
  status: string;

  route?: RouteEntity;
  vehicle?: VehicleEntity;

  constructor(partial: Partial<TripEntity>) {
    Object.assign(this, partial);
  }
}
