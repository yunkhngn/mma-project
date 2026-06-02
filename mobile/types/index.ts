export interface User {
  id: number;
  firebaseUid: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'passenger' | 'admin';
  avatar?: string;
  fcmToken?: string;
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
  type: 'limousine' | 'sleeper';
  seatLayout: {
    rows: number;
    cols: number;
  };
}

export interface Trip {
  id: number;
  routeId: number;
  vehicleId: number;
  departureAt: string;
  price: number;
  licensePlate: string;
  status: 'active' | 'completed' | 'cancelled';
  route?: Route;
  vehicle?: Vehicle;
}

export interface Seat {
  id: number;
  tripId: number;
  seatNumber: number;
  status: 'available' | 'locked' | 'booked';
  lockedUntil?: string;
  bookingId?: number;
}

export interface Payment {
  id: number;
  bookingId: number;
  method: 'cash' | 'vietqr';
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  paidAt?: string;
  gatewayRef?: string;
}

export interface Booking {
  id: number;
  userId: number;
  tripId: number;
  seatId: number;
  ticketCode: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  qrData?: string;
  createdAt: string;
  trip?: Trip;
  seat?: Seat;
  payments?: Payment[];
}

export interface Conversation {
  passengerId: string;
  passengerName: string;
  passengerEmail: string;
  lastMessage: string;
  lastMessageAt: any;
  unreadByAdmin: boolean;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export interface RevenueReport {
  totalRevenue: number;
  totalTickets: number;
  breakdownByRoute: {
    routeId: number;
    origin: string;
    destination: string;
    ticketsSold: number;
    revenue: number;
  }[];
  breakdownByDate: {
    date: string;
    ticketsSold: number;
    revenue: number;
  }[];
}
