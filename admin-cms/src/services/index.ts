import axiosInstance from '@/lib/axios';
import type { User, Route, Trip, Vehicle, VehicleType, Booking, RevenueReport } from '@/types';

// ==========================================
// USER SERVICE
// ==========================================
export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await axiosInstance.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: {
    email: string;
    fullName: string;
    phone?: string;
    role: 'passenger' | 'admin';
    password?: string;
  }): Promise<User> => {
    const response = await axiosInstance.post<User>('/users', data);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      fullName?: string;
      phone?: string;
      role?: 'passenger' | 'admin';
      email?: string;
      password?: string;
    },
  ): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<User> => {
    const response = await axiosInstance.delete<User>(`/users/${id}`);
    return response.data;
  },
};

// ==========================================
// ROUTE SERVICE
// ==========================================
export const routeService = {
  getAll: async (): Promise<Route[]> => {
    const response = await axiosInstance.get<Route[]>('/routes');
    return response.data;
  },

  getById: async (id: number): Promise<Route> => {
    const response = await axiosInstance.get<Route>(`/routes/${id}`);
    return response.data;
  },

  create: async (data: { origin: string; destination: string; distanceKm: number }): Promise<Route> => {
    const response = await axiosInstance.post<Route>('/routes', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Omit<Route, 'id'>>): Promise<Route> => {
    const response = await axiosInstance.put<Route>(`/routes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<Route> => {
    const response = await axiosInstance.delete<Route>(`/routes/${id}`);
    return response.data;
  },
};

// ==========================================
// TRIP SERVICE
// ==========================================
export const tripService = {
  getAll: async (): Promise<Trip[]> => {
    const response = await axiosInstance.get<Trip[]>('/trips');
    return response.data;
  },

  getById: async (id: number): Promise<Trip> => {
    const response = await axiosInstance.get<Trip>(`/trips/${id}`);
    return response.data;
  },

  create: async (data: {
    routeId: number;
    vehicleId: number;
    departureAt: string;
    price: number;
    licensePlate: string;
    status?: 'active' | 'inactive' | 'cancelled';
  }): Promise<Trip> => {
    const response = await axiosInstance.post<Trip>('/trips', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Omit<Trip, 'id' | 'route' | 'vehicle'>>): Promise<Trip> => {
    const response = await axiosInstance.put<Trip>(`/trips/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<Trip> => {
    const response = await axiosInstance.delete<Trip>(`/trips/${id}`);
    return response.data;
  },
};

// ==========================================
// REPORT SERVICE
// ==========================================
export const reportService = {
  getRevenue: async (params?: {
    startDate?: string;
    endDate?: string;
    routeId?: number;
    vehicleId?: number;
  }): Promise<RevenueReport> => {
    const response = await axiosInstance.get<RevenueReport>('/reports/revenue', { params });
    return response.data;
  },
};

// ==========================================
// VEHICLE SERVICE
// ==========================================
export const vehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await axiosInstance.get<Vehicle[]>('/vehicles');
    return response.data;
  },

  getById: async (id: number): Promise<Vehicle> => {
    const response = await axiosInstance.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    totalSeats: number;
    type: string;
    seatLayout?: any;
  }): Promise<Vehicle> => {
    const response = await axiosInstance.post<Vehicle>('/vehicles', data);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      name?: string;
      totalSeats?: number;
      type?: string;
      seatLayout?: any;
    },
  ): Promise<Vehicle> => {
    const response = await axiosInstance.put<Vehicle>(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<Vehicle> => {
    const response = await axiosInstance.delete<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  getAllTypes: async (): Promise<VehicleType[]> => {
    const response = await axiosInstance.get<VehicleType[]>('/vehicles/types');
    return response.data;
  },

  createType: async (data: { name: string }): Promise<VehicleType> => {
    const response = await axiosInstance.post<VehicleType>('/vehicles/types', data);
    return response.data;
  },

  updateType: async (id: number, data: { name: string }): Promise<VehicleType> => {
    const response = await axiosInstance.put<VehicleType>(`/vehicles/types/${id}`, data);
    return response.data;
  },

  deleteType: async (id: number): Promise<VehicleType> => {
    const response = await axiosInstance.delete<VehicleType>(`/vehicles/types/${id}`);
    return response.data;
  },
};

// ==========================================
// BOOKING SERVICE
// ==========================================
export const bookingService = {
  getAll: async (): Promise<Booking[]> => {
    const response = await axiosInstance.get<Booking[]>('/bookings');
    return response.data;
  },

  getById: async (id: number): Promise<Booking> => {
    const response = await axiosInstance.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  update: async (id: number, data: { status?: 'pending' | 'confirmed' | 'cancelled'; price?: number }): Promise<Booking> => {
    const response = await axiosInstance.put<Booking>(`/bookings/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<Booking> => {
    const response = await axiosInstance.delete<Booking>(`/bookings/${id}`);
    return response.data;
  },
};
