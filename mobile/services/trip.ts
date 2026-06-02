import { apiFetch } from './api';
import { Trip } from '../types';

export const tripService = {
  /**
   * Lấy danh sách tất cả chuyến xe.
   */
  async getAllTrips(): Promise<Trip[]> {
    return apiFetch<Trip[]>('/trips');
  },

  /**
   * Lấy chi tiết chuyến xe theo ID.
   */
  async getTripById(id: number): Promise<Trip> {
    return apiFetch<Trip>(`/trips/${id}`);
  },

  /**
   * Tìm kiếm chuyến xe lọc theo điểm đi, điểm đến và ngày đi.
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
