import { Module } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BookingsModule } from '../bookings/bookings.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, BookingsModule, AuthModule],
  providers: [SeatsService],
  controllers: [SeatsController],
})
export class SeatsModule {}
