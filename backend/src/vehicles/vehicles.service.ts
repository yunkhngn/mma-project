import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleEntity } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<VehicleEntity[]> {
    const vehicles = await this.prisma.vehicle.findMany();
    return vehicles.map((vehicle) => new VehicleEntity(vehicle));
  }

  async findOne(id: number): Promise<VehicleEntity | null> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    return vehicle ? new VehicleEntity(vehicle) : null;
  }
}
