import { apiFetch } from './api';
import { Trip } from '../types';

export const tripService = {
  /**
   * Get a list of all trips.
   */
  async getAllTrips(): Promise<Trip[]> {
    return apiFetch<Trip[]>('/trips');
  },

  /**
   * Get trip details by its ID.
   */
  async getTripById(id: number): Promise<Trip> {
    return apiFetch<Trip>(`/trips/${id}`);
  },

  /**
   * Search for trips filtered by origin, destination, and departure date.
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
};
