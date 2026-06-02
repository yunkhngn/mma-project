import React, { useEffect, useState } from 'react';
import { vehicleService } from '@/services';
import type { Vehicle, VehicleType } from '@/types';
import { Eye, Truck, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Vehicle Types state
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [editingTypeName, setEditingTypeName] = useState('');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [name, setName] = useState('');
  const [totalSeats, setTotalSeats] = useState(9);
  const [type, setType] = useState('limousine');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const vData = await vehicleService.getAll();
      setVehicles(vData);
      if (vData.length) {
        setSelectedVehicle(vData[0]);
      } else {
        setSelectedVehicle(null);
      }

      const vtData = await vehicleService.getAllTypes();
      setVehicleTypes(vtData);
      if (vtData.length) {
        setType(vtData[0].name);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vehicles and types list');
    } finally {
      setLoading(false);
    }
  }

  async function loadVehiclesOnly() {
    try {
      const vData = await vehicleService.getAll();
      setVehicles(vData);
      const matched = vData.find((x) => x.id === selectedVehicle?.id);
      if (matched) {
        setSelectedVehicle(matched);
      } else if (vData.length) {
        setSelectedVehicle(vData[0]);
      } else {
        setSelectedVehicle(null);
      }
    } catch (err) {
      console.error('Failed to reload vehicles list', err);
    }
  }

  async function loadVehicleTypesOnly() {
    try {
      const vtData = await vehicleService.getAllTypes();
      setVehicleTypes(vtData);
    } catch (err) {
      console.error('Failed to reload vehicle types list', err);
    }
  }

  const openCreate = () => {
    setEditingVehicle(null);
    setName('');
    setTotalSeats(9);
    if (vehicleTypes.length) {
      setType(vehicleTypes[0].name);
    } else {
      setType('limousine');
    }
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setName(v.name);
    setTotalSeats(v.totalSeats);
    setType(v.type);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, {
          name,
          totalSeats: Number(totalSeats),
          type,
        });
        setIsFormOpen(false);
        await loadVehiclesOnly();
      } else {
        await vehicleService.create({
          name,
          totalSeats: Number(totalSeats),
          type,
        });
        setIsFormOpen(false);
        await loadVehiclesOnly();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save vehicle');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle? This will fail if there are active trips linked to it.')) return;
    try {
      await vehicleService.delete(id);
      await loadVehiclesOnly();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete vehicle');
    }
  };

  // Vehicle Type CRUD Handlers
  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    try {
      await vehicleService.createType({ name: newTypeName.trim().toLowerCase() });
      setNewTypeName('');
      await loadVehicleTypesOnly();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to add type');
    }
  };

  const startEditType = (vt: VehicleType) => {
    setEditingTypeId(vt.id);
    setEditingTypeName(vt.name);
  };

  const handleUpdateType = async (id: number) => {
    if (!editingTypeName.trim()) return;
    try {
      await vehicleService.updateType(id, { name: editingTypeName.trim().toLowerCase() });
      setEditingTypeId(null);
      await loadVehicleTypesOnly();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update type');
    }
  };

  const handleDeleteType = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle type? Vehicles with this type won\'t be affected, but you won\'t be able to select it anymore.')) return;
    try {
      await vehicleService.deleteType(id);
      await loadVehicleTypesOnly();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete type');
    }
  };

  const getSeatingLayout = (vehicle: Vehicle) => {
    const total = vehicle.totalSeats;
    const cols = 3;
    const rows = Math.ceil(total / cols);
    const seatsArray = [];
    for (let i = 1; i <= total; i++) {
      seatsArray.push({
        seatNumber: i,
        label: `A${i}`,
      });
    }
    return { rows, cols, seats: seatsArray };
  };

  if (loading) return <div className="text-center py-10 text-slate-600">Loading vehicles list...</div>;
  if (error) return <div className="text-red-500 bg-red-50 border border-red-200 p-4 rounded-md">{error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar: Vehicles List & Vehicle Types management */}
      <div className="lg:col-span-1 space-y-6">
        {/* Vehicles List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Fleet List</h3>
            <button
              onClick={openCreate}
              className="inline-flex items-center px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Vehicle
            </button>
          </div>

          <div className="space-y-3">
            {vehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedVehicle?.id === v.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{v.name}</h4>
                    <p className={`text-xs mt-1 ${selectedVehicle?.id === v.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      Type: <span className="capitalize">{v.type}</span>
                    </p>
                  </div>
                  <Truck className="h-5 w-5 opacity-80" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100/10 pt-3">
                  <span className="text-xs font-semibold">Capacity: {v.totalSeats} seats</span>
                  <span className="text-xs underline flex items-center">
                    <Eye className="h-3 w-3 mr-1" /> View Layout
                  </span>
                </div>
              </div>
            ))}
            {!vehicles.length && (
              <div className="text-center text-sm text-slate-500 py-10">No vehicles registered.</div>
            )}
          </div>
        </div>

        {/* Vehicle Types Management */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4 shadow-sm">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-bold text-sm text-slate-800">Manage Vehicle Types</h4>
            <p className="text-xs text-slate-400 mt-0.5">Define fleet categorization types</p>
          </div>

          <form onSubmit={handleAddType} className="flex gap-2">
            <input
              type="text"
              required
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="e.g. VIP Sleeper"
              className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs text-slate-950 focus:border-slate-500 focus:outline-none bg-white"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Add
            </button>
          </form>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {vehicleTypes.map((vt) => (
              <div key={vt.id} className="flex items-center justify-between text-xs py-1.5 px-2 bg-slate-50 rounded border border-slate-100">
                {editingTypeId === vt.id ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={editingTypeName}
                      onChange={(e) => setEditingTypeName(e.target.value)}
                      className="flex-1 rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-950 focus:border-slate-500 focus:outline-none bg-white font-medium"
                    />
                    <button
                      onClick={() => handleUpdateType(vt.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded transition-colors"
                      title="Save"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setEditingTypeId(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 bg-slate-100 rounded transition-colors"
                      title="Cancel"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="capitalize font-semibold text-slate-700">{vt.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditType(vt)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                        title="Edit Type"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteType(vt.id)}
                        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                        title="Delete Type"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {!vehicleTypes.length && (
              <div className="text-center text-xs text-slate-400 py-4">No custom types defined.</div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Vehicle Seating Chart & Details */}
      <div className="lg:col-span-2">
        {selectedVehicle ? (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-900 leading-6">
                Seating Configuration: {selectedVehicle.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEdit(selectedVehicle)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedVehicle.id)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-red-200 rounded text-xs font-semibold text-red-600 bg-white hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Information Cards */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Specifications</h4>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-hidden">
                  <div className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-slate-500">Vehicle ID</span>
                    <span className="font-semibold text-slate-900">#{selectedVehicle.id}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-slate-500">Name / Model</span>
                    <span className="font-semibold text-slate-900">{selectedVehicle.name}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-slate-500">Vehicle Type</span>
                    <span className="font-semibold text-slate-900 capitalize">{selectedVehicle.type}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-slate-500">Seat Capacity</span>
                    <span className="font-semibold text-slate-900">{selectedVehicle.totalSeats} seats</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                  <h5 className="text-xs font-bold text-slate-500">Layout Preview Legend</h5>
                  <div className="flex items-center space-x-4 pt-1">
                    <div className="flex items-center text-xs text-slate-600">
                      <span className="w-4 h-4 rounded bg-slate-100 border border-slate-300 mr-1.5 inline-block"></span>
                      Seat
                    </div>
                    <div className="flex items-center text-xs text-slate-600">
                      <span className="w-4 h-4 rounded bg-teal-500 border border-teal-600 mr-1.5 inline-block"></span>
                      Driver
                    </div>
                  </div>
                </div>
              </div>

              {/* Seating Grid Design */}
              <div className="flex flex-col items-center border border-slate-200 rounded-lg p-6 bg-slate-50">
                <span className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-widest">FRONT OF BUS</span>

                {/* Dashboard / Driver Row */}
                <div className="w-full max-w-[200px] flex justify-between mb-8 border-b border-slate-200 pb-4">
                  <div className="px-3 py-1 rounded bg-teal-500 border border-teal-600 text-white text-xs font-bold">
                    Steering
                  </div>
                  <div className="px-3 py-1 rounded bg-slate-900 border border-slate-950 text-white text-xs font-bold">
                    Driver
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${getSeatingLayout(selectedVehicle).cols}, minmax(0, 1fr))` }}>
                  {getSeatingLayout(selectedVehicle).seats.map((seat) => (
                    <div
                      key={seat.seatNumber}
                      className="w-12 h-12 rounded border border-slate-300 bg-white flex items-center justify-center text-xs font-bold text-slate-700 shadow-xs cursor-default hover:bg-slate-100 transition-colors"
                      title={`Seat ${seat.label}`}
                    >
                      {seat.label}
                    </div>
                  ))}
                </div>

                <span className="text-xs font-semibold text-slate-400 mt-8 uppercase tracking-widest">REAR OF BUS</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
            No vehicle details available.
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-900">
                {editingVehicle ? `Edit Vehicle Specifications #${editingVehicle.id}` : 'Add New Vehicle'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="text-red-600 bg-red-50 border border-red-200 text-sm text-center py-2 px-3 rounded-md">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Vehicle Name / Model</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. DCAR President Limousine"
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-955 placeholder-slate-400 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Seat Capacity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(Number(e.target.value))}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-955 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Vehicle Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-955 focus:border-slate-500 focus:outline-none sm:text-sm bg-white capitalize"
                  >
                    {vehicleTypes.map((vt) => (
                      <option key={vt.id} value={vt.name}>
                        {vt.name}
                      </option>
                    ))}
                    {!vehicleTypes.length && (
                      <option value="limousine">Limousine</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
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
