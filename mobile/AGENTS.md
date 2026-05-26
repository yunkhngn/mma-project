# MMA Mobile — Agent Rules

> These rules apply to ALL AI agents working on this codebase.
> Read and follow them strictly before writing any code.

---

## 0. Expo Version

This project uses **Expo SDK 56**. Always reference versioned docs before writing code:
https://docs.expo.dev/versions/v56.0.0/

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 56 |
| Navigation | Expo Router (file-based, lives in `src/app/`) |
| Language | TypeScript (strict mode) |
| Styling | **NativeWind v4** (Tailwind CSS for React Native) |
| UI Components | **react-native-reusables** (shadcn/ui for React Native) — lives in `src/components/ui/` |
| Icons | **lucide-react-native** |
| State | Zustand (`src/store/`) |
| Auth | Firebase Authentication (JS SDK v9+) |
| Realtime | Firestore (`onSnapshot` listeners) |
| HTTP | Custom `apiFetch` wrapper (`src/services/api.ts`) |
| Notifications | `expo-notifications` |

---

## 2. Project Structure

```
src/
├── app/              # Expo Router screens (file-based routes only)
├── components/       # Shared UI — Atomic Design layers (see Section 3)
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── features/         # Feature-domain modules (see Section 4)
│   ├── auth/
│   ├── trips/
│   ├── booking/
│   ├── chat/
│   ├── profile/
│   └── admin/
├── services/         # API + Firebase clients (see Section 5)
├── store/            # Zustand global state slices
├── hooks/            # Shared custom hooks
├── types/            # Shared TypeScript interfaces (index.ts)
├── constants/        # Colors, spacing, config constants
└── utils/            # Pure helper functions (no side effects)
```

---

## 3. Atomic Design Rules

Components live in `src/components/` and follow strict Atomic Design.

### ATOMS — `src/components/atoms/`
- Smallest indivisible UI unit
- **No business logic, no API calls, no store access**
- Accept only primitive props (`string`, `number`, `boolean`, `ViewStyle`, `onPress`)
- Must be 100% reusable across the entire app
- Examples: `Button`, `AppText`, `Icon`, `Badge`, `Avatar`, `Spinner`, `Divider`, `TextInput`, `Chip`

### MOLECULES — `src/components/molecules/`
- Combine 2+ atoms into a focused UI unit
- May have simple **local state** (e.g. input focus, toggle)
- **No direct API calls** — receive all data via props
- Examples: `TripCard`, `SeatCard`, `FormField`, `MessageBubble`, `SearchBar`, `NotificationItem`

### ORGANISMS — `src/components/organisms/`
- Complex, self-contained UI sections
- **May access Zustand store or call services** when unavoidable
- Domain-specific (not generic across apps)
- Examples: `SeatMap`, `TripSearchForm`, `BookingList`, `ChatConversation`, `RevenueChart`, `AppHeader`

### TEMPLATES — `src/components/templates/`
- Full-screen layout shells — define spacing, scroll, safe area
- **Receive all data via props — no real data fetching inside**
- One template per screen layout pattern
- Examples: `AuthTemplate`, `ChatTemplate`, `DashboardTemplate`, `ListDetailTemplate`

### Forbidden imports (enforced by convention)
```
atoms      → cannot import molecules, organisms, templates, features
molecules  → cannot import organisms, templates, features
organisms  → cannot import templates
templates  → cannot import features
features   → cannot import other features
```

---

## 4. Feature Module Rules

Feature modules live in `src/features/<domain>/` and group everything for one business domain.

```
features/<domain>/
├── components/    # Feature-specific UI (not shared across features)
├── hooks/         # Feature-specific hooks (useBooking, useChat, etc.)
└── index.ts       # Public API — only export what other layers need
```

### Available domains
| Domain | Responsibility |
|---|---|
| `auth` | Firebase login/register, profile sync (`POST /auth/sync`) |
| `trips` | Trip search (`GET /trips/search`), trip detail, seat selection |
| `booking` | Create booking, booking history (`GET /bookings/my-history`), cancel |
| `chat` | Passenger ↔ Admin real-time Firestore messaging |
| `profile` | View & update user profile, avatar upload |
| `admin` | Route/Trip/Booking CRUD, revenue reports (Admin role only) |

### Rule: Features must NOT import each other
Cross-feature communication must go through:
- `src/services/` — API/Firestore calls
- `src/store/` — Zustand shared state
- `src/hooks/` — shared hooks

---

## 5. Services Rules

All backend communication lives in `src/services/`.

```
services/
├── firebase.ts              # Firebase app, auth, db initialization
├── api.ts                   # apiFetch() — base HTTP client with auto-auth
├── auth.service.ts          # POST /auth/sync, POST /auth/admin/login
├── user.service.ts          # GET|PUT /users (Admin), PUT /users/profile
├── route.service.ts         # GET|POST|PUT|DELETE /routes
├── trip.service.ts          # GET|POST|PUT|DELETE /trips, GET /trips/search
├── booking.service.ts       # GET|POST|PUT|DELETE /bookings, POST /bookings/:id/cancel
├── chat.service.ts          # Firestore listeners + POST /chat/*/send
├── report.service.ts        # GET /reports/revenue (Admin)
├── notification.service.ts  # expo-notifications: register, listen, dismiss
└── index.ts                 # Barrel export for all services
```

### `apiFetch` behavior
- Auto-injects `Authorization: Bearer <Firebase ID Token>` for all requests
- Set `isMultipart = true` as 3rd argument when sending `FormData` (e.g. avatar upload)
- Throws `Error` with backend's `message` field on non-2xx responses
- Base URL read from `EXPO_PUBLIC_API_URL` environment variable

### API URL by environment
| Runtime | `EXPO_PUBLIC_API_URL` |
|---|---|
| Android Emulator | `http://10.0.2.2:3000/api` |
| iOS Simulator | `http://localhost:3000/api` |
| Physical Device | `http://<your-machine-ip>:3000/api` |

---

## 6. Screens (Expo Router)

Screens live in `src/app/` as Expo Router file-based routes.

### Rules
- Screens are **thin** — minimal logic, mostly composition
- A screen = a **Template** + **Organisms/Molecules** + data fetching via feature hooks
- Do NOT write business logic directly inside a screen file
- Do NOT call `apiFetch` directly in a screen — use a service via a feature hook

### Role-based routing
- Admin screens must check `user.role === 'admin'` before rendering
- Use a shared `useAuth()` hook (in `src/hooks/`) that returns the current user + role
- Redirect unauthorized users at the layout level, not inside individual screens

---

## 7. TypeScript Rules

- **Strict mode** is enabled — no `any` unless absolutely necessary and documented
- All shared data shapes are defined in `src/types/index.ts`
- Do NOT duplicate type definitions — always import from `@/types`
- CSS/module declarations are in `src/types/declarations.d.ts`

---

## 8. Environment Variables

- All client-side env vars must be prefixed with `EXPO_PUBLIC_`
- Never hardcode API keys or Firebase config values in source code
- `.env` and `google-services.json` are gitignored — never commit them
- Reference `.env.example` for the full list of required variables

---

## 9. Security Rules

- Every API call that touches user data must include the Firebase ID Token (handled automatically by `apiFetch`)
- Admin-only features must verify `user.role === 'admin'` client-side AND rely on backend `AdminGuard`
- Never expose raw Firebase tokens in logs

---

## 10. Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Component file | PascalCase | `TripCard.tsx` |
| Hook file | camelCase, prefix `use` | `useBookingHistory.ts` |
| Service file | camelCase, suffix `.service.ts` | `booking.service.ts` |
| Type/Interface | PascalCase | `interface Booking {}` |
| Zustand slice | camelCase, suffix `.store.ts` | `auth.store.ts` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_SEAT_LOCK_SECONDS` |
| Folder | kebab-case (if multi-word) | `trip-search/` |
