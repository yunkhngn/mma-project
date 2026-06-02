import { apiFetch } from './api';
import { Booking } from '../types';

export const bookingService = {
  /**
   * Get details of a booked ticket by its ID.
   */
  async getBookingById(id: number): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}`);
  },

  /**
   * Book a new trip ticket.
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
   * Get the booking history of the current passenger.
   */
  async getMyHistory(): Promise<Booking[]> {
    return apiFetch<Booking[]>('/bookings/my-history');
  },

  /**
   * Cancel a booking (cancel the passenger's own ticket).
   */
  async cancelBooking(id: number): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  },
};
