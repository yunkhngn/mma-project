import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Body,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RouteEntity } from './entities/route.entity';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  async findAll(): Promise<RouteEntity[]> {
    return this.routesService.findAll();
  }

  @Post()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async create(
    @Body() body: { origin: string; destination: string; distanceKm: number },
  ): Promise<RouteEntity> {
    return this.routesService.create(body);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RouteEntity> {
    const route = await this.routesService.findOne(id);
    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }
    return route;
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: { origin?: string; destination?: string; distanceKm?: number },
  ): Promise<RouteEntity> {
    return this.routesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<RouteEntity> {
    return this.routesService.remove(id);
  }
}
