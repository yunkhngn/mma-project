import { apiFetch } from './api';
import { Trip } from '../types';

export const tripService = {
  /**
   * Retrieves all trips.
   */
  async getAllTrips(): Promise<Trip[]> {
    return apiFetch<Trip[]>('/trips');
  },

  /**
   * Retrieves detailed trip information by ID.
   */
  async getTripById(id: number): Promise<Trip> {
    return apiFetch<Trip>(`/trips/${id}`);
  },

  /**
   * Searches for trips based on origin, destination, and departure date.
   */
  async searchTrips(
    origin: string,
    destination: string,
    departureDate: string
  ): Promise<Trip[]> {
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate,
    });
    return apiFetch<Trip[]>(`/trips/search?${params.toString()}`);
  },

  /**
   * Creates a new trip (Admin only).
   */
  async createTrip(data: {
    routeId: number;
    vehicleId: number;
    departureAt: string;
    price: number;
    licensePlate: string;
    status?: string;
  }): Promise<Trip> {
    return apiFetch<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Updates trip details (Admin only).
   */
  async updateTrip(
    id: number,
    data: {
      routeId?: number;
      vehicleId?: number;
      departureAt?: string;
      price?: number;
      licensePlate?: string;
      status?: string;
    }
  ): Promise<Trip> {
    return apiFetch<Trip>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Deletes a trip (Admin only).
   */
  async deleteTrip(id: number): Promise<Trip> {
    return apiFetch<Trip>(`/trips/${id}`, {
      method: 'DELETE',
    });
  },
};
