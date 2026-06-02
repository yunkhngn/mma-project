import { apiFetch } from './api';
import { Route } from '../types';

export const routeService = {
  /**
   * Get a list of all routes.
   */
  async getAllRoutes(): Promise<Route[]> {
    return apiFetch<Route[]>('/routes');
  },

  /**
   * Get route details by its ID.
   */
  async getRouteById(id: number): Promise<Route> {
    return apiFetch<Route>(`/routes/${id}`);
  },
};
