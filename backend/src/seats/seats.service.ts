import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeatEntity } from './entities/seat.entity';

@Injectable()
export class SeatsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<SeatEntity[]> {
    const seats = await this.prisma.seat.findMany();
    return seats.map((seat) => new SeatEntity(seat));
  }

  async findOne(id: number): Promise<SeatEntity | null> {
    const seat = await this.prisma.seat.findUnique({ where: { id } });
    return seat ? new SeatEntity(seat) : null;
  }
}
