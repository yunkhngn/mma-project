import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookingService } from '@/services';
import type { Booking } from '@/types';
import { Eye, Edit2, Trash2 } from 'lucide-react';

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search parameters for filtering by specific user from routing
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');

  // Edit / view state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form input states
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');
  const [price, setPrice] = useState<number>(0);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await bookingService.getAll();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }

  const openEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setStatus(booking.status);
    setPrice(Number(booking.price));
    setFormError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setFormError('');
    setFormLoading(true);
    try {
      await bookingService.update(editingBooking.id, {
        status,
        price: Number(price),
      });
      setEditingBooking(null);
      loadBookings();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update booking');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking? This will release the seat reservation.')) return;
    try {
      await bookingService.delete(id);
      loadBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete booking');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!userIdParam) return true;
    return String(b.userId) === userIdParam;
  });

  if (loading) return <div className="text-center py-10 text-slate-600">Loading booking records...</div>;
  if (error) return <div className="text-red-500 bg-red-50 border border-red-200 p-4 rounded-md">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500">Track and manage user seat reservations and tickets</div>

      {/* User filter banner */}
      {userIdParam && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-2.5 rounded-md text-sm flex items-center justify-between shadow-xs">
          <span className="font-medium">Showing bookings only for User ID #{userIdParam}</span>
          <button
            onClick={() => setSearchParams({})}
            className="underline font-semibold hover:text-teal-950 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white shadow-sm rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ticket Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trip Details</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Seat</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-950 font-bold">{booking.ticketCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    <div className="font-semibold text-slate-950">{booking.user?.fullName || `User #${booking.userId}`}</div>
                    <div className="text-xs text-slate-400">{booking.user?.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="font-medium text-slate-700">
                      {booking.trip?.route?.origin} ➔ {booking.trip?.route?.destination}
                    </div>
                    <div className="text-xs text-slate-400">
                      {booking.trip?.departureAt ? new Date(booking.trip.departureAt).toLocaleString() : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-center font-bold">
                    {booking.seat?.seatNumber || `Seat ID #${booking.seatId}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-955 text-right font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(booking.price))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                      booking.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : booking.status === 'cancelled'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => openEdit(booking)}
                      className="inline-flex items-center px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="inline-flex items-center px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredBookings.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">No bookings exist.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Booking View Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-900">
                Booking Details - {selectedBooking.ticketCode}
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-t border-slate-100 pt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ticket ID:</span>
                  <span className="text-slate-800 font-semibold">{selectedBooking.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ticket Code:</span>
                  <span className="text-slate-900 font-bold">{selectedBooking.ticketCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">User Passenger:</span>
                  <span className="text-slate-800 font-semibold">{selectedBooking.user?.fullName || `User ID ${selectedBooking.userId}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Passenger Email:</span>
                  <span className="text-slate-800 font-semibold">{selectedBooking.user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Vehicle / License Plate:</span>
                  <span className="text-slate-800 font-semibold">
                    {selectedBooking.trip?.vehicle?.name} ({selectedBooking.trip?.licensePlate})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Route Connection:</span>
                  <span className="text-slate-800 font-semibold">
                    {selectedBooking.trip?.route?.origin} ➔ {selectedBooking.trip?.route?.destination}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Departure Time:</span>
                  <span className="text-slate-800 font-semibold">
                    {selectedBooking.trip?.departureAt ? new Date(selectedBooking.trip.departureAt).toLocaleString() : ''}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Seat Number:</span>
                  <span className="text-slate-850 font-bold bg-slate-100 px-2 py-0.5 rounded text-xs">
                    {selectedBooking.seat?.seatNumber}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Paid Ticket Price:</span>
                  <span className="text-slate-800 font-semibold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(selectedBooking.price))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Booked At:</span>
                  <span className="text-slate-800 font-semibold">
                    {new Date(selectedBooking.bookedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Booking Status:</span>
                  <span className="text-slate-850 font-bold uppercase">{selectedBooking.status}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-900">
                Edit Booking status - {editingBooking.ticketCode}
              </h3>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="text-red-600 bg-red-50 border border-red-200 text-sm text-center py-2 px-3 rounded-md">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 focus:border-slate-500 focus:outline-none sm:text-sm bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Price Override (VND)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-955 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 transition-colors"
                >
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
