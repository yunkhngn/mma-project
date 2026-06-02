import React, { useEffect, useState } from 'react';
import { tripService, routeService, vehicleService } from '@/services';
import type { Trip, Route, Vehicle } from '@/types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function TripManagementPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // Form states
  const [routeId, setRouteId] = useState<number>(0);
  const [vehicleId, setVehicleId] = useState<number>(0);
  const [departureAt, setDepartureAt] = useState('');
  const [price, setPrice] = useState(100000);
  const [licensePlate, setLicensePlate] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'cancelled'>('active');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [tripData, routeData, vehicleData] = await Promise.all([
        tripService.getAll(),
        routeService.getAll(),
        vehicleService.getAll(),
      ]);
      setTrips(tripData);
      setRoutes(routeData);
      setVehicles(vehicleData);
      if (routeData.length) setRouteId(routeData[0].id);
      if (vehicleData.length) setVehicleId(vehicleData[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch catalog data');
    } finally {
      setLoading(false);
    }
  }

  const openCreate = () => {
    setRouteId(routes[0]?.id || 0);
    setVehicleId(vehicles[0]?.id || 0);
    setDepartureAt(new Date(Date.now() + 86400000).toISOString().slice(0, 16)); // Default tomorrow
    setPrice(150000);
    setLicensePlate('');
    setStatus('active');
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setRouteId(trip.routeId);
    setVehicleId(trip.vehicleId);
    // Format ISO string to datetime-local local input format: YYYY-MM-DDTHH:MM
    setDepartureAt(new Date(trip.departureAt).toISOString().slice(0, 16));
    setPrice(Number(trip.price));
    setLicensePlate(trip.licensePlate);
    setStatus(trip.status);
    setFormError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await tripService.create({
        routeId,
        vehicleId,
        departureAt: new Date(departureAt).toISOString(),
        price: Number(price),
        licensePlate,
        status,
      });
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create trip');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;
    setFormError('');
    setFormLoading(true);
    try {
      await tripService.update(editingTrip.id, {
        routeId,
        vehicleId,
        departureAt: new Date(departureAt).toISOString(),
        price: Number(price),
        licensePlate,
        status,
      });
      setEditingTrip(null);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update trip');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trip? It will fail if bookings exist.')) return;
    try {
      await tripService.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete trip');
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-600">Loading trips catalog...</div>;
  if (error) return <div className="text-red-500 bg-red-50 border border-red-200 p-4 rounded-md">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">Configure scheduling, pricing, and assignments</div>
        <button
          onClick={openCreate}
          className="inline-flex items-center px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Trip
        </button>
      </div>

      {/* Trips Catalog */}
      <div className="bg-white shadow-sm rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trip ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle (Plate)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Departure At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {trips.map((trip) => {
                const associatedRoute = routes.find((r) => r.id === trip.routeId);
                const associatedVehicle = vehicles.find((v) => v.id === trip.vehicleId);

                return (
                  <tr key={trip.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-950 font-semibold">#{trip.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {associatedRoute ? `${associatedRoute.origin} ➔ ${associatedRoute.destination}` : `Route #${trip.routeId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="font-medium text-slate-700">{associatedVehicle?.name || `Vehicle #${trip.vehicleId}`}</div>
                      <div className="text-xs text-slate-400">{trip.licensePlate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(trip.departureAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-950 text-right font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(trip.price))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        trip.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : trip.status === 'cancelled'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      <button
                        onClick={() => openEdit(trip)}
                        className="inline-flex items-center px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(trip.id)}
                        className="inline-flex items-center px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!trips.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">No trips scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal Form */}
      {(isCreateOpen || editingTrip) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-900">
                {isCreateOpen ? 'Create New Trip Schedule' : `Edit Trip Schedule #${editingTrip?.id}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingTrip(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={isCreateOpen ? handleCreate : handleUpdate}>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="text-red-600 bg-red-50 border border-red-200 text-sm text-center py-2 px-3 rounded-md">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Select Route</label>
                  <select
                    value={routeId}
                    onChange={(e) => setRouteId(Number(e.target.value))}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 focus:border-slate-500 focus:outline-none sm:text-sm bg-white"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.origin} ➔ {r.destination} ({r.distanceKm} km)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Assign Vehicle</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(Number(e.target.value))}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 focus:border-slate-500 focus:outline-none sm:text-sm bg-white"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.totalSeats} seats)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">License Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 29A-888.88"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Departure Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={departureAt}
                    onChange={(e) => setDepartureAt(e.target.value)}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Price (VND)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 focus:border-slate-500 focus:outline-none sm:text-sm bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingTrip(null);
                  }}
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
