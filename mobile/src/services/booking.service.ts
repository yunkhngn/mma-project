import { apiFetch } from './api';
import { Booking } from '../types';

export const bookingService = {
  /**
   * Retrieves all bookings (Admin only).
   */
  async getAllBookings(): Promise<Booking[]> {
    return apiFetch<Booking[]>('/bookings');
  },

  /**
   * Retrieves detailed booking information by ID.
   */
  async getBookingById(id: number): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}`);
  },

  /**
   * Creates a new ticket booking.
   */
  async createBooking(
    tripId: number,
    seatId: number,
    paymentMethod: 'cash' | 'vietqr'
  ): Promise<Booking> {
    return apiFetch<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify({ tripId, seatId, paymentMethod }),
    });
  },

  /**
   * Retrieves booking history for the currently logged-in passenger.
   */
  async getMyHistory(): Promise<Booking[]> {
    return apiFetch<Booking[]>('/bookings/my-history');
  },

  /**
   * Cancels a booking (Passenger cancels their own ticket).
   */
  async cancelBooking(id: number): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  },

  /**
   * Updates booking status or price (Admin only).
   */
  async updateBooking(
    id: number,
    data: { status?: 'pending' | 'confirmed' | 'cancelled'; price?: number }
  ): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Deletes a booking record (Admin only).
   */
  async deleteBooking(id: number): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};
