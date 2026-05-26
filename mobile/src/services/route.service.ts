import { apiFetch } from './api';
import { Route } from '../types';

export const routeService = {
  /**
   * Retrieves all routes.
   */
  async getAllRoutes(): Promise<Route[]> {
    return apiFetch<Route[]>('/routes');
  },

  /**
   * Retrieves detailed route information by ID.
   */
  async getRouteById(id: number): Promise<Route> {
    return apiFetch<Route>(`/routes/${id}`);
  },

  /**
   * Creates a new route (Admin only).
   */
  async createRoute(origin: string, destination: string, distanceKm: number): Promise<Route> {
    return apiFetch<Route>('/routes', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, distanceKm }),
    });
  },

  /**
   * Updates route details (Admin only).
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
   * Deletes a route (Admin only).
   */
  async deleteRoute(id: number): Promise<Route> {
    return apiFetch<Route>(`/routes/${id}`, {
      method: 'DELETE',
    });
  },
};
