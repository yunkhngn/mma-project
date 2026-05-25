import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RouteEntity } from './entities/route.entity';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  async findAll(): Promise<RouteEntity[]> {
    return this.routesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RouteEntity> {
    const route = await this.routesService.findOne(id);
    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }
    return route;
  }
}
