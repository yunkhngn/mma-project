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

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  async findAll(): Promise<TripEntity[]> {
    return this.tripsService.findAll();
  }

  @Post()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
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
  async search(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('departureDate') departureDate: string,
  ): Promise<TripEntity[]> {
    return this.tripsService.searchTrips(origin, destination, departureDate);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TripEntity> {
    const trip = await this.tripsService.findOne(id);
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
    return trip;
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
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
  async remove(@Param('id', ParseIntPipe) id: number): Promise<TripEntity> {
    return this.tripsService.remove(id);
  }
}
