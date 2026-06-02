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
};
