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

  /**
   * Tạo chuyến xe mới (Chỉ dành cho Admin).
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
   * Cập nhật thông tin chuyến xe (Chỉ dành cho Admin).
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
   * Xóa chuyến xe (Chỉ dành cho Admin).
   */
  async deleteTrip(id: number): Promise<Trip> {
    return apiFetch<Trip>(`/trips/${id}`, {
      method: 'DELETE',
    });
  },
};
