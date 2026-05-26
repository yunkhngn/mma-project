# Design Specification: UC03 to UC08 - Core Booking and Payment Flow

This design document specifies the architecture and implementation details for the core passenger workflow: searching trips, viewing seats, locking/booking seats, processing payments (including VietQR simulation), history tracking, and cancellation.

## 1. Problem Statement
We need to implement the core user scenarios for passengers:
- **UC03: Tìm kiếm chuyến xe**: Search trips by origin, destination, and departure date.
- **UC04: Sơ đồ & Chọn ghế**: Show interactive seats. Lock seat during booking for 15 minutes.
- **UC05 & UC06: Đặt vé & Thanh toán VietQR**: Book a seat. Generate a payment request with a VietQR image link. Confirm payment.
- **UC07: Lịch sử đặt vé**: List past/active bookings. Automatically mark past departures as `'completed'`.
- **UC08: Hủy vé**: Cancel a booking before departure (no refund needed).

## 2. Proposed Changes

### 2.1 Database States
- **Seat.status**: `'available'`, `'locked'`, `'booked'`.
- **Booking.status**: `'pending'`, `'confirmed'`, `'cancelled'`.
- **Payment.status**: `'pending'`, `'paid'`, `'cancelled'`, `'expired'`.

### 2.2 Expiration & Self-Healing Logic
To release unpaid seats after 15 minutes without requiring cron jobs:
- In service methods querying seats or creating bookings, we perform a clean-up check:
  - Find all `Seat` records where `status = 'booked'` (or `status = 'locked'`) and the linked `Booking` has status `'pending'`, but the `Payment` has `expiresAt < now`.
  - Automatically update those seats to `status = 'available'`, `bookingId = null`.
  - Set those `Booking` records to `status = 'cancelled'`.
  - Set those `Payment` records to `status = 'expired'`.

## 3. API Endpoints

### 3.1 Trips Module (UC03)
- `GET /trips/search?origin=...&destination=...&departureDate=YYYY-MM-DD`
  - Returns matching trips based on route origin/destination (case-insensitive substring) and date.

### 3.2 Seats Module (UC04)
- `GET /seats/trip/:tripId`
  - Returns seats for a trip. If the seats are not yet initialized in the database, automatically generate `totalSeats` records for the trip (self-healing pre-generation).
- `POST /seats/lock` (Auth required)
  - Body: `{ tripId, seatNumber }`
  - Temporarily locks a seat by setting `status = 'locked'` and `lockedUntil = now + 15 minutes`.

### 3.3 Bookings Module (UC05, UC07, UC08)
- `POST /bookings` (Auth required)
  - Body: `{ tripId, seatId, paymentMethod: 'cash' | 'vietqr' }`
  - Checks if seat is available/locked by user. Creates a booking and payment. Sets `expiresAt = now + 15 minutes`.
  - Generates `ticketCode = TKT-XXXXXX` and `qrData` link:
    `https://img.vietqr.io/image/MB-0123456789-compact2.png?amount=100000&addInfo=TKT-XXXXXX`
- `GET /bookings/my-history` (Auth required)
  - Returns bookings for the logged-in user. If `booking.status === 'confirmed'` and `trip.departureAt < now`, maps display status to `'completed'`.
- `POST /bookings/:id/cancel` (Auth required)
  - Cancels the booking if `trip.departureAt > now`. Resets the seat status to `'available'`.

### 3.4 Payments Module (UC06)
- `POST /payments/:paymentId/confirm` (Simulated VietQR IPN callback)
  - Confirms payment: sets `Payment.status = 'paid'`, `Booking.status = 'confirmed'`, and `Seat.status = 'booked'`.

## 4. Implementation Plan

### Task 1: Add Unit and Integration Tests for Booking flow
- Write spec tests for searching trips, listing seats, booking creation, confirmation, history retrieval, and cancellation.

### Task 2: Implement Endpoints and Business Logic
- Update services and controllers in `trips`, `seats`, `bookings`, and `payments` modules.
- Ensure all endpoints are protected by `FirebaseAuthGuard` where required.

### Task 3: Lint and Verify
- Run tests and ESLint to guarantee code quality.
