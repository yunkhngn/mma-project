export interface User {
  id: number;
  firebaseUid: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'passenger' | 'driver' | 'admin';
  avatar?: string | null;
  fcmToken?: string | null;
  createdAt: string;
}

export interface Route {
  id: number;
  origin: string;
  destination: string;
  distanceKm: number;
}

export interface Vehicle {
  id: number;
  name: string;
  totalSeats: number;
  type: string;
  seatLayout: unknown;
}

export interface VehicleType {
  id: number;
  name: string;
}

export interface Trip {
  id: number;
  routeId: number;
  vehicleId: number;
  departureAt: string;
  price: number;
  licensePlate: string;
  status: 'active' | 'inactive' | 'cancelled';
  route?: Route;
  vehicle?: Vehicle;
}

export interface Seat {
  id: number;
  tripId: number;
  seatNumber: number;
  status: 'available' | 'locked' | 'booked';
  bookingId?: number | null;
  lockedUntil?: string | null;
}

export interface Booking {
  id: number;
  userId: number;
  tripId: number;
  seatId: number;
  ticketCode: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  qrData: string;
  bookedAt: string;
  user?: User;
  trip?: Trip;
  seat?: Seat;
}

export interface Payment {
  id: number;
  bookingId: number;
  method: 'cash' | 'vietqr';
  gatewayRef: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  paidAt?: string | null;
  expiresAt?: string | null;
}

export interface RevenueReport {
  totalRevenue: number;
  totalTicketsSold: number;
  breakdownByRoute: Array<{
    routeId: number;
    origin: string;
    destination: string;
    revenue: number;
    ticketsSold: number;
  }>;
  breakdownByDate: Array<{
    date: string;
    ticketsSold: number;
    revenue: number;
  }>;
}
