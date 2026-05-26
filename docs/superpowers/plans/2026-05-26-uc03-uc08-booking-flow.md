# UC03 to UC08 - Core Booking & Payment Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete passenger workflow from searching trips, viewing/locking seats, creating a booking, simulating payment confirmation via VietQR, viewing booking history, to cancelling a ticket.

---

## Plan Details

### Task 1: Self-Healing Expiration Cleanup & Helper Methods

- [ ] **Step 1: Implement `releaseExpiredBookings` in `BookingsService`**
  - Query all payments where `status === 'pending'` and `expiresAt < now`.
  - For each expired payment:
    - Update `Payment` status to `'expired'`.
    - Update `Booking` status to `'cancelled'`.
    - Update associated `Seat` status to `'available'` and set `bookingId = null`.

---

### Task 2: Implement UC03 - Searching Trips

- [ ] **Step 1: Update `TripsService` to support search**
  - Implement `searchTrips(origin: string, destination: string, dateStr: string)`:
    - Parse `dateStr` into start-of-day and end-of-day UTC/local times.
    - Query `Trip` records where `route.origin` contains `origin`, `route.destination` contains `destination`, and `departureAt` falls within the parsed date.
    - Include `route` and `vehicle` relationships.

- [ ] **Step 2: Update `TripsController` with `GET /trips/search`**
  - Add `@Get('search')` handler taking query parameters `origin`, `destination`, and `departureDate`.

- [ ] **Step 3: Write tests for UC03 in `trips.service.spec.ts` and `trips.controller.spec.ts`**
  - Confirm correct query arguments are passed to Prisma.

---

### Task 3: Implement UC04 - Sơ đồ & Chọn ghế

- [ ] **Step 1: Update `SeatsService` with `findOrCreateSeatsForTrip`**
  - Look up the trip and its vehicle.
  - Call the expiration cleanup helper to ensure outdated locks/bookings are cleared.
  - Query all `Seat` records for the `tripId`.
  - If seats count is 0: pre-populate `totalSeats` records with `status = 'available'`.
  - Return the seats and the vehicle's `seatLayout`.

- [ ] **Step 2: Update `SeatsService` with `lockSeat`**
  - Implement `lockSeat(userId: number, tripId: number, seatNumber: number)`:
    - Call the expiration cleanup helper.
    - Find the seat. If status is not `'available'` (and not locked by current user / expired), throw `BadRequestException`.
    - Update seat status to `'locked'` and set `lockedUntil = now + 15 minutes`.

- [ ] **Step 3: Update `SeatsController`**
  - Add `GET /seats/trip/:tripId` to return the grid.
  - Add `POST /seats/lock` (Protected by `FirebaseAuthGuard`).

- [ ] **Step 4: Write tests for UC04 in `seats.service.spec.ts` and `seats.controller.spec.ts`**

---

### Task 4: Implement UC05 & UC06 - Đặt vé & Thanh toán VietQR

- [ ] **Step 1: Update `BookingsService.create` to handle booking requests**
  - Call the expiration cleanup helper.
  - Fetch the seat. Check if seat is `'available'` or `'locked'` (and not booked by someone else).
  - Generate a unique `ticketCode` (e.g. `TKT-` + timestamp + random chars).
  - Compute `qrData` link using `https://img.vietqr.io/image/...`.
  - Create the `Booking` with status `'pending'`.
  - Create `Payment` with status `'pending'`, the amount of the trip, and `expiresAt = now + 15 minutes`.
  - Update `Seat.bookingId` to `booking.id` and `Seat.status = 'booked'`.

- [ ] **Step 2: Update `BookingsController`**
  - Add `POST /bookings` (Protected by `FirebaseAuthGuard`).

- [ ] **Step 3: Update `PaymentsService` and `PaymentsController`**
  - Add `POST /payments/:paymentId/confirm` (Simulates VietQR IPN callback):
    - Update `Payment` status to `'paid'` and `paidAt = now`.
    - Update `Booking` status to `'confirmed'`.
    - Update associated `Seat` status to `'booked'`.

- [ ] **Step 4: Write tests for UC05 and UC06 in `bookings.service.spec.ts` and `payments.service.spec.ts`**

---

### Task 5: Implement UC07 - Lịch sử đặt vé

- [ ] **Step 1: Implement `myHistory` in `BookingsService`**
  - Call the expiration cleanup helper.
  - Fetch all bookings for `userId`, sorted by `bookedAt` desc.
  - Map status: if `booking.status === 'confirmed'` and `trip.departureAt < now`, set the response display status to `'completed'`.

- [ ] **Step 2: Update `BookingsController`**
  - Add `GET /bookings/my-history` (Protected by `FirebaseAuthGuard`).

---

### Task 6: Implement UC08 - Hủy vé

- [ ] **Step 1: Implement `cancelBooking` in `BookingsService`**
  - Find the booking. Check if it belongs to the user.
  - Check if `trip.departureAt < now`. If yes, throw `BadRequestException`.
  - Set `Booking.status = 'cancelled'`.
  - Set associated `Payment.status = 'cancelled'`.
  - Set associated `Seat.status = 'available'` and `bookingId = null`.

- [ ] **Step 2: Update `BookingsController`**
  - Add `POST /bookings/:id/cancel` (Protected by `FirebaseAuthGuard`).

---

### Task 7: Verification

- [ ] **Step 1: Run all unit and integration tests**
  - Ensure all tests pass.
- [ ] **Step 2: Run linter and verify zero errors**
- [ ] **Step 3: Rebuild and check Docker logs to ensure perfect deployment**
