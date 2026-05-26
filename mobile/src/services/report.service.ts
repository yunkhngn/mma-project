import { apiFetch } from './api';
import { RevenueReport } from '../types';

export const reportService = {
  /**
   * Lấy báo cáo thống kê doanh thu và lượng vé bán ra (Chỉ dành cho Admin).
   */
  async getRevenueReport(filters?: {
    startDate?: string;
    endDate?: string;
    routeId?: number;
    vehicleId?: number;
  }): Promise<RevenueReport> {
    const paramsObj: Record<string, string> = {};
    if (filters) {
      if (filters.startDate) paramsObj.startDate = filters.startDate;
      if (filters.endDate) paramsObj.endDate = filters.endDate;
      if (filters.routeId) paramsObj.routeId = filters.routeId.toString();
      if (filters.vehicleId) paramsObj.vehicleId = filters.vehicleId.toString();
    }
    const params = new URLSearchParams(paramsObj);
    return apiFetch<RevenueReport>(`/reports/revenue?${params.toString()}`);
  },
};
