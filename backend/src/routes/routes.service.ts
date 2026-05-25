import { Injectable } from '@nestjs/common';
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
}
