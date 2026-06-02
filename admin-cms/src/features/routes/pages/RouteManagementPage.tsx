import React, { useEffect, useState } from 'react';
import { routeService } from '@/services';
import type { Route } from '@/types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function RouteManagementPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  // Form inputs
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState(100);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadRoutes();
  }, []);

  async function loadRoutes() {
    try {
      const data = await routeService.getAll();
      setRoutes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  }

  const openCreate = () => {
    setOrigin('');
    setDestination('');
    setDistanceKm(100);
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEdit = (route: Route) => {
    setEditingRoute(route);
    setOrigin(route.origin);
    setDestination(route.destination);
    setDistanceKm(route.distanceKm);
    setFormError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await routeService.create({ origin, destination, distanceKm: Number(distanceKm) });
      setIsCreateOpen(false);
      loadRoutes();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create route');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;
    setFormError('');
    setFormLoading(true);
    try {
      await routeService.update(editingRoute.id, { origin, destination, distanceKm: Number(distanceKm) });
      setEditingRoute(null);
      loadRoutes();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update route');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this route? This will fail if there are active trips.')) return;
    try {
      await routeService.delete(id);
      loadRoutes();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete route');
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-600">Loading routes...</div>;
  if (error) return <div className="text-red-500 bg-red-50 border border-red-200 p-4 rounded-md">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">Manage connections and distances</div>
        <button
          onClick={openCreate}
          className="inline-flex items-center px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Route
        </button>
      </div>

      {/* Routes Table */}
      <div className="bg-white shadow-sm rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Route ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Origin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Distance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {routes.map((route) => (
                <tr key={route.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-950 font-semibold">#{route.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{route.origin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{route.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{route.distanceKm} km</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => openEdit(route)}
                      className="inline-flex items-center px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="inline-flex items-center px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!routes.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">No routes registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Form Modal */}
      {(isCreateOpen || editingRoute) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-900">
                {isCreateOpen ? 'Create New Route' : `Edit Route #${editingRoute?.id}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingRoute(null);
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
                  <label className="block text-sm font-semibold text-slate-700">Origin Station</label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Hanoi"
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Destination Station</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Haiphong"
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Distance (km)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingRoute(null);
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
