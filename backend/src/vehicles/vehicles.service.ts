import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleEntity } from './entities/vehicle.entity';
import { VehicleTypeEntity } from './entities/vehicle-type.entity';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<VehicleEntity[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      orderBy: { id: 'desc' },
    });
    return vehicles.map((vehicle) => new VehicleEntity(vehicle));
  }

  async findOne(id: number): Promise<VehicleEntity | null> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    return vehicle ? new VehicleEntity(vehicle) : null;
  }

  async create(data: {
    name: string;
    totalSeats: number;
    type: string;
    seatLayout?: any;
  }): Promise<VehicleEntity> {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        name: data.name,
        totalSeats: Number(data.totalSeats),
        type: data.type,
        seatLayout: data.seatLayout || {},
      },
    });
    return new VehicleEntity(vehicle);
  }

  async update(
    id: number,
    data: {
      name?: string;
      totalSeats?: number;
      type?: string;
      seatLayout?: any;
    },
  ): Promise<VehicleEntity> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: {
        name: data.name,
        totalSeats: data.totalSeats !== undefined ? Number(data.totalSeats) : undefined,
        type: data.type,
        seatLayout: data.seatLayout || undefined,
      },
    });
    return new VehicleEntity(updated);
  }

  async delete(id: number): Promise<VehicleEntity> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    const deleted = await this.prisma.vehicle.delete({
      where: { id },
    });
    return new VehicleEntity(deleted);
  }

  // ==========================================
  // VEHICLE TYPE CRUD ACTIONS
  // ==========================================

  async findAllTypes(): Promise<VehicleTypeEntity[]> {
    const types = await this.prisma.vehicleType.findMany({
      orderBy: { id: 'asc' },
    });
    return types.map((t) => new VehicleTypeEntity(t));
  }

  async createType(data: { name: string }): Promise<VehicleTypeEntity> {
    const t = await this.prisma.vehicleType.create({
      data: { name: data.name },
    });
    return new VehicleTypeEntity(t);
  }

  async updateType(id: number, data: { name: string }): Promise<VehicleTypeEntity> {
    const t = await this.prisma.vehicleType.findUnique({ where: { id } });
    if (!t) {
      throw new NotFoundException(`VehicleType with ID ${id} not found`);
    }
    const updated = await this.prisma.vehicleType.update({
      where: { id },
      data: { name: data.name },
    });
    return new VehicleTypeEntity(updated);
  }

  async deleteType(id: number): Promise<VehicleTypeEntity> {
    const t = await this.prisma.vehicleType.findUnique({ where: { id } });
    if (!t) {
      throw new NotFoundException(`VehicleType with ID ${id} not found`);
    }
    const deleted = await this.prisma.vehicleType.delete({
      where: { id },
    });
    return new VehicleTypeEntity(deleted);
  }
}
