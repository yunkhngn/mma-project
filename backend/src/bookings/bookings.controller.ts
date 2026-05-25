import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingEntity } from './entities/booking.entity';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll(): Promise<BookingEntity[]> {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BookingEntity> {
    const booking = await this.bookingsService.findOne(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }
}
