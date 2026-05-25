import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatEntity } from './entities/seat.entity';

@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get()
  async findAll(): Promise<SeatEntity[]> {
    return this.seatsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SeatEntity> {
    const seat = await this.seatsService.findOne(id);
    if (!seat) {
      throw new NotFoundException(`Seat with ID ${id} not found`);
    }
    return seat;
  }
}
