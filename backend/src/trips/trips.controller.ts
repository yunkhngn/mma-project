import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripEntity } from './entities/trip.entity';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  async findAll(): Promise<TripEntity[]> {
    return this.tripsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TripEntity> {
    const trip = await this.tripsService.findOne(id);
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
    return trip;
  }
}
