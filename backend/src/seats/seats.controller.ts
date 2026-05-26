import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Post,
  UseGuards,
  Body,
  Request,
} from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatEntity } from './entities/seat.entity';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';

@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get()
  async findAll(): Promise<SeatEntity[]> {
    return this.seatsService.findAll();
  }

  @Get('trip/:tripId')
  async findOrCreateSeatsForTrip(
    @Param('tripId', ParseIntPipe) tripId: number,
  ): Promise<{ seats: SeatEntity[]; seatLayout: any }> {
    return this.seatsService.findOrCreateSeatsForTrip(tripId);
  }

  @Post('lock')
  @UseGuards(FirebaseAuthGuard)
  async lockSeat(
    @Request() req: ExpressRequest & { user: User },
    @Body() body: { tripId: number; seatNumber: number },
  ): Promise<SeatEntity> {
    return this.seatsService.lockSeat(
      req.user.id,
      body.tripId,
      body.seatNumber,
    );
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
