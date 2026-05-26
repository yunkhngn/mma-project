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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) { }

  @Get()
  @ApiOperation({ summary: 'Get all routes' })
  @ApiResponse({ status: 200, description: 'Return all routes.' })
  async findAll(): Promise<RouteEntity[]> {
    return this.routesService.findAll();
  }

  @Post()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new route (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['origin', 'destination', 'distanceKm'],
      properties: {
        origin: { type: 'string', example: 'Hanoi' },
        destination: { type: 'string', example: 'Haiphong' },
        distanceKm: { type: 'integer', example: 120 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Route created successfully.' })
  async create(
    @Body() body: { origin: string; destination: string; distanceKm: number },
  ): Promise<RouteEntity> {
    return this.routesService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by ID' })
  @ApiResponse({ status: 200, description: 'Return route details.' })
  @ApiResponse({ status: 404, description: 'Route not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RouteEntity> {
    const route = await this.routesService.findOne(id);
    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }
    return route;
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing route (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        origin: { type: 'string', example: 'Hanoi' },
        destination: { type: 'string', example: 'Haiphong' },
        distanceKm: { type: 'integer', example: 125 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Route updated successfully.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: { origin?: string; destination?: string; distanceKm?: number },
  ): Promise<RouteEntity> {
    return this.routesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a route (Admin only)' })
  @ApiResponse({ status: 200, description: 'Route deleted successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete route with active trips.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<RouteEntity> {
    return this.routesService.remove(id);
  }
}
