import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService, RevenueReport } from './reports.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get revenue and ticketing reports (Admin only)' })
  @ApiQuery({
    name: 'startDate',
    type: String,
    required: false,
    example: '2026-05-01',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    required: false,
    example: '2026-05-31',
  })
  @ApiQuery({ name: 'routeId', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'vehicleId', type: Number, required: false, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Return aggregated revenue report.',
  })
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
