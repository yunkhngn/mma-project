import { apiFetch } from './api';
import { Route } from '../types';

export const routeService = {
  /**
   * Lấy danh sách tất cả các tuyến đường.
   */
  async getAllRoutes(): Promise<Route[]> {
    return apiFetch<Route[]>('/routes');
  },

  /**
   * Lấy chi tiết thông tin của một tuyến đường theo ID.
   */
  async getRouteById(id: number): Promise<Route> {
    return apiFetch<Route>(`/routes/${id}`);
  },

  /**
   * Tạo tuyến đường mới (Chỉ dành cho Admin).
   */
  async createRoute(origin: string, destination: string, distanceKm: number): Promise<Route> {
    return apiFetch<Route>('/routes', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, distanceKm }),
    });
  },

  /**
   * Cập nhật thông tin tuyến đường (Chỉ dành cho Admin).
   */
  async updateRoute(
    id: number,
    data: { origin?: string; destination?: string; distanceKm?: number }
  ): Promise<Route> {
    return apiFetch<Route>(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Xóa tuyến đường (Chỉ dành cho Admin).
   */
  async deleteRoute(id: number): Promise<Route> {
    return apiFetch<Route>(`/routes/${id}`, {
      method: 'DELETE',
    });
  },
};
