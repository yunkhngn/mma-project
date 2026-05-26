/**
 * FEATURES — Domain-driven feature modules.
 *
 * Each feature folder groups everything related to one business domain:
 *   feature/
 *   ├── components/      Feature-specific atoms/molecules/organisms (not shared)
 *   ├── hooks/           Feature-specific custom hooks (useBooking, useChat...)
 *   └── index.ts         Public API — only export what other features need
 *
 * Available features:
 * - auth/        Login, registration, Firebase Auth sync
 * - trips/       Trip search, trip detail, seat selection
 * - booking/     Create booking, booking history, cancel ticket
 * - chat/        Passenger ↔ Admin real-time messaging
 * - profile/     View & edit user profile, avatar upload
 * - admin/       Admin dashboard, route/trip/booking management, revenue reports
 *
 * Rule: Features must NOT import from each other directly.
 * Cross-feature communication goes through shared services or global store.
 */
