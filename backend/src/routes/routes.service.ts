import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RouteEntity } from './entities/route.entity';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<RouteEntity[]> {
    const routes = await this.prisma.route.findMany();
    return routes.map((route) => new RouteEntity(route));
  }

  async findOne(id: number): Promise<RouteEntity | null> {
    const route = await this.prisma.route.findUnique({ where: { id } });
    return route ? new RouteEntity(route) : null;
  }

  async create(data: {
    origin: string;
    destination: string;
    distanceKm: number;
  }): Promise<RouteEntity> {
    const route = await this.prisma.route.create({ data });
    return new RouteEntity(route);
  }

  async update(
    id: number,
    data: { origin?: string; destination?: string; distanceKm?: number },
  ): Promise<RouteEntity> {
    const existing = await this.prisma.route.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    const route = await this.prisma.route.update({
      where: { id },
      data,
    });
    return new RouteEntity(route);
  }

  async remove(id: number): Promise<RouteEntity> {
    const existing = await this.prisma.route.findUnique({
      where: { id },
      include: { _count: { select: { trips: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    if (existing._count.trips > 0) {
      throw new BadRequestException(
        'Cannot delete route as it has associated trips',
      );
    }

    const route = await this.prisma.route.delete({ where: { id } });
    return new RouteEntity(route);
  }
}
