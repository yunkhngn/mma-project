import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  NotFoundException,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripEntity } from './entities/trip.entity';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all trips' })
  @ApiResponse({ status: 200, description: 'Return all trips.' })
  async findAll(): Promise<TripEntity[]> {
    return this.tripsService.findAll();
  }

  @Post()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new trip (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'routeId',
        'vehicleId',
        'departureAt',
        'price',
        'licensePlate',
      ],
      properties: {
        routeId: { type: 'integer', example: 1 },
        vehicleId: { type: 'integer', example: 1 },
        departureAt: {
          type: 'string',
          format: 'date-time',
          example: '2026-05-27T08:00:00Z',
        },
        price: { type: 'number', example: 150000.0 },
        licensePlate: { type: 'string', example: '29A-888.88' },
        status: { type: 'string', example: 'active' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Trip created successfully.' })
  async create(
    @Body()
    body: {
      routeId: number;
      vehicleId: number;
      departureAt: string;
      price: number;
      licensePlate: string;
      status?: string;
    },
  ): Promise<TripEntity> {
    return this.tripsService.create(body);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search trips for passengers' })
  @ApiQuery({ name: 'origin', type: String, example: 'Hanoi' })
  @ApiQuery({ name: 'destination', type: String, example: 'Haiphong' })
  @ApiQuery({ name: 'departureDate', type: String, example: '2026-05-27' })
  @ApiResponse({ status: 200, description: 'Return matched trips.' })
  async search(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('departureDate') departureDate: string,
  ): Promise<TripEntity[]> {
    return this.tripsService.searchTrips(origin, destination, departureDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip details by ID' })
  @ApiResponse({ status: 200, description: 'Return trip details.' })
  @ApiResponse({ status: 404, description: 'Trip not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TripEntity> {
    const trip = await this.tripsService.findOne(id);
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
    return trip;
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing trip (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        routeId: { type: 'integer', example: 1 },
        vehicleId: { type: 'integer', example: 1 },
        departureAt: {
          type: 'string',
          format: 'date-time',
          example: '2026-05-27T09:00:00Z',
        },
        price: { type: 'number', example: 160000.0 },
        licensePlate: { type: 'string', example: '29A-888.88' },
        status: { type: 'string', example: 'active' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Trip updated successfully.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      routeId?: number;
      vehicleId?: number;
      departureAt?: string;
      price?: number;
      licensePlate?: string;
      status?: string;
    },
  ): Promise<TripEntity> {
    return this.tripsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a trip (Admin only)' })
  @ApiResponse({ status: 200, description: 'Trip deleted successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete trip with active bookings.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<TripEntity> {
    return this.tripsService.remove(id);
  }
}
