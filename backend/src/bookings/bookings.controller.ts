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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all bookings.' })
  async findAll(): Promise<BookingEntity[]> {
    return this.bookingsService.findAll();
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new ticket booking' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tripId', 'seatId', 'paymentMethod'],
      properties: {
        tripId: { type: 'integer', example: 1 },
        seatId: { type: 'integer', example: 1 },
        paymentMethod: {
          type: 'string',
          enum: ['cash', 'vietqr'],
          example: 'vietqr',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Booking created successfully.' })
  async create(
    @Request() req: ExpressRequest & { user: User },
    @Body()
    body: { tripId: number; seatId: number; paymentMethod: 'cash' | 'vietqr' },
  ): Promise<BookingEntity> {
    return this.bookingsService.create(req.user.id, body);
  }

  @Get('my-history')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get booking history of the authenticated passenger',
  })
  @ApiResponse({ status: 200, description: 'Return passenger bookings.' })
  async getMyHistory(
    @Request() req: ExpressRequest & { user: User },
  ): Promise<BookingEntity[]> {
    return this.bookingsService.myHistory(req.user.id);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get booking details by ID' })
  @ApiResponse({ status: 200, description: 'Return booking details.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BookingEntity> {
    const booking = await this.bookingsService.findOne(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update booking status/price (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'cancelled'],
          example: 'confirmed',
        },
        price: { type: 'number', example: 150000.0 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Booking updated successfully.' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a booking (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<BookingEntity> {
    return this.bookingsService.remove(id);
  }

  @Post(':id/cancel')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel a booking by the ticket owner' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully.' })
  async cancel(
    @Request() req: ExpressRequest & { user: User },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BookingEntity> {
    return this.bookingsService.cancelBooking(req.user.id, id);
  }
}
