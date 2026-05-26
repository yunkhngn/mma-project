import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Post,
  Put,
  Delete,
  UseGuards,
  Body,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingEntity } from './entities/booking.entity';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async findAll(): Promise<BookingEntity[]> {
    return this.bookingsService.findAll();
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async create(
    @Request() req: ExpressRequest & { user: User },
    @Body()
    body: { tripId: number; seatId: number; paymentMethod: 'cash' | 'vietqr' },
  ): Promise<BookingEntity> {
    return this.bookingsService.create(req.user.id, body);
  }

  @Get('my-history')
  @UseGuards(FirebaseAuthGuard)
  async getMyHistory(
    @Request() req: ExpressRequest & { user: User },
  ): Promise<BookingEntity[]> {
    return this.bookingsService.myHistory(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BookingEntity> {
    const booking = await this.bookingsService.findOne(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      status?: 'pending' | 'confirmed' | 'cancelled';
      price?: number;
    },
  ): Promise<BookingEntity> {
    return this.bookingsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<BookingEntity> {
    return this.bookingsService.remove(id);
  }

  @Post(':id/cancel')
  @UseGuards(FirebaseAuthGuard)
  async cancel(
    @Request() req: ExpressRequest & { user: User },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BookingEntity> {
    return this.bookingsService.cancelBooking(req.user.id, id);
  }
}
