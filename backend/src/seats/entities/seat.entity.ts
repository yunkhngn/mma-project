export class SeatEntity {
  id: number;
  tripId: number;
  seatNumber: number;
  status: string;
  bookingId: number | null;
  lockedUntil: Date | null;

  constructor(partial: Partial<SeatEntity>) {
    Object.assign(this, partial);
  }
}
