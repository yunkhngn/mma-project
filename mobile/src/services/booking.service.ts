import { apiFetch } from './api';
import { Booking } from '../types';

export const bookingService = {
  /**
   * Lấy toàn bộ danh sách đặt vé (Chỉ dành cho Admin).
   */
  async getAllBookings(): Promise<Booking[]> {
    return apiFetch<Booking[]>('/bookings');
  },

  /**
   * Lấy chi tiết thông tin vé đã đặt.
   */
  async getBookingById(id: number): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}`);
  },

  /**
   * Đặt vé xe mới.
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
   * Lấy lịch sử đặt vé của hành khách hiện tại.
   */
  async getMyHistory(): Promise<Booking[]> {
    return apiFetch<Booking[]>('/bookings/my-history');
  },

  /**
   * Hủy vé (Hành khách hủy vé của mình).
   */
  async cancelBooking(id: number): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  },

  /**
   * Cập nhật trạng thái/giá vé đặt (Chỉ dành cho Admin).
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
   * Xóa đơn vé (Chỉ dành cho Admin).
   */
  async deleteBooking(id: number): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};
