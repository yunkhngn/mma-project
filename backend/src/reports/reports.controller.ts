import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService, RevenueReport } from './reports.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async getRevenueReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('routeId') routeId?: number,
    @Query('vehicleId') vehicleId?: number,
  ): Promise<RevenueReport> {
    return this.reportsService.getRevenueReport({
      startDate,
      endDate,
      routeId,
      vehicleId,
    });
  }
}
