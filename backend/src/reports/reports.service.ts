import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface RevenueReport {
  totalRevenue: number;
  totalTicketsSold: number;
  breakdownByRoute: {
    routeId: number;
    origin: string;
    destination: string;
    ticketsSold: number;
    revenue: number;
  }[];
  breakdownByDate: {
    date: string;
    ticketsSold: number;
    revenue: number;
  }[];
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueReport(filters: {
    startDate?: string;
    endDate?: string;
    routeId?: number;
    vehicleId?: number;
  }): Promise<RevenueReport> {
    const { startDate, endDate, routeId, vehicleId } = filters;
    const whereClause: Prisma.BookingWhereInput = {
      status: 'confirmed',
    };

    if (startDate || endDate) {
      whereClause.bookedAt = {};
      if (startDate) {
        whereClause.bookedAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        whereClause.bookedAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    if (routeId || vehicleId) {
      whereClause.trip = {};
      if (routeId) {
        whereClause.trip.routeId = Number(routeId);
      }
      if (vehicleId) {
        whereClause.trip.vehicleId = Number(vehicleId);
      }
    }

    const bookings = await this.prisma.booking.findMany({
      where: whereClause,
      include: {
        trip: {
          include: {
            route: true,
            vehicle: true,
          },
        },
      },
    });

    const totalTicketsSold = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.price), 0);

    const routeMap = new Map<
      number,
      {
        origin: string;
        destination: string;
        ticketsSold: number;
        revenue: number;
      }
    >();
    const dateMap = new Map<string, { ticketsSold: number; revenue: number }>();

    for (const b of bookings) {
      const trip = b.trip;
      const rId = trip.routeId;
      const routePrice = Number(b.price);

      // Route Breakdown
      if (!routeMap.has(rId)) {
        routeMap.set(rId, {
          origin: trip.route.origin,
          destination: trip.route.destination,
          ticketsSold: 0,
          revenue: 0,
        });
      }
      const routeStat = routeMap.get(rId)!;
      routeStat.ticketsSold += 1;
      routeStat.revenue += routePrice;

      // Date Breakdown (YYYY-MM-DD)
      const dateStr = b.bookedAt.toISOString().split('T')[0];
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          ticketsSold: 0,
          revenue: 0,
        });
      }
      const dateStat = dateMap.get(dateStr)!;
      dateStat.ticketsSold += 1;
      dateStat.revenue += routePrice;
    }

    const breakdownByRoute = Array.from(routeMap.entries()).map(
      ([routeId, stat]) => ({
        routeId,
        ...stat,
      }),
    );

    const breakdownByDate = Array.from(dateMap.entries())
      .map(([date, stat]) => ({
        date,
        ...stat,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRevenue,
      totalTicketsSold,
      breakdownByRoute,
      breakdownByDate,
    };
  }
}
