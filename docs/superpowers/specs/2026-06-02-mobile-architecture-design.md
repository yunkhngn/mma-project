# Mobile Architecture Design Specification

**Date:** 2026-06-02
**Author:** Antigravity (AI Coding Assistant)
**Status:** Approved

## 1. Goal
Establish a scalable, modular, and maintainable folder layout and component architecture for the React Native (Expo) mobile application.

## 2. Architectural Pattern: Feature-Based + Atomic Design
We adopt a hybrid architectural pattern combining **Global Atomic Design** for shared UI primitives and **Feature-Based Module Segmentation** for business logic, services, local hooks, and screens.

### 2.1 Component Level Definition (Atomic Design)
* **Atoms (`components/atoms/`):** Smallest, indestructible UI units. They do not depend on any other components. Examples: `Button`, `Input`, `Text`, `Badge`, `Spinner`.
* **Molecules (`components/molecules/`):** Combinations of atoms. They can contain layout styling but do not have business logic or state beyond UI state (e.g., toggle state). Examples: `FormInput` (Label + Input + ErrorText), `HeaderBar`, `Card`.
* **Organisms (`components/organisms/`):** High-level component groupings. Can compose molecules and atoms, but remain independent of feature-specific business logic. Examples: `CustomModal`, `GenericList`.
* **Feature Components (`features/<feature_name>/components/`):** Specific, domain-bound components with flat structures (e.g., `LoginForm.tsx`, `BookingDetailCard.tsx`). They combine global atoms/molecules with feature-specific business logic.

---

## 3. Directory Layout Spec
The file structure under `mobile/` will be structured as follows:

```
mobile/
├── app/                       # Expo Router - File-system routing
│   ├── (auth)/                # Route group for authentication flow
│   ├── (tabs)/                # Route group for bottom tab navigation
│   └── _layout.tsx            # Main application root layout
│
├── components/                # Global Reusable UI Components (Atomic Design)
│   ├── atoms/                 # Base UI primitives (e.g., Button.tsx, Typography.tsx)
│   ├── molecules/             # Composite UI components (e.g., FormField.tsx, InfoRow.tsx)
│   ├── organisms/             # Structural UI components (e.g., AppModal.tsx)
│   └── ui/                    # UI primitives from libraries (e.g., react-native-reusables)
│
├── features/                  # Business Domain Modules
│   ├── auth/                  # Authentication Module
│   │   ├── components/        # Local components (e.g., LoginForm.tsx)
│   │   ├── hooks/             # Local hooks (e.g., useAuthForm.ts)
│   │   ├── services/          # Auth-specific API/Firebase logic
│   │   ├── types/             # Auth typescript definitions
│   │   └── index.ts           # Public API entrypoint
│   │
│   ├── bookings/              # Bookings Module
│   │   ├── components/        # Local components (e.g., BookingCard.tsx)
│   │   ├── hooks/             # Local hooks (e.g., useBookings.ts)
│   │   ├── services/          # Bookings API client
│   │   ├── types/             # Booking types
│   │   └── index.ts
│   │
│   └── vehicles/              # Vehicles Module
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── index.ts
│
├── services/                  # Global SDK & Client Integrations
│   ├── api.ts                 # Base Axios/Fetch client config (interceptors, headers)
│   └── firebase.ts            # Global Firebase Initialization
│
├── hooks/                     # Global reusable hooks (e.g., useThemeColor, useDebounce)
├── context/                   # Global React Contexts (e.g., AuthContext, ThemeContext)
├── constants/                 # Shared Constants (e.g., Colors, Spacing, Typography)
├── types/                     # Shared TypeScript interfaces (e.g., API responses, global entities)
└── utils/                     # Pure helper utilities (e.g., date-formatters, validations)
```

---

## 4. Implementation Guidelines
1. **Public API Pattern (`index.ts`):** Each folder inside `features/*` should expose a single entrypoint `index.ts` containing `export *` for components, hooks, or functions that other parts of the app are allowed to use. Internal implementations must not be directly imported across features.
2. **State Location:** Local UI state belongs in components/hooks. Domain-specific state belongs in Context or custom React Query hooks (if implemented) within their respective feature folders.
3. **No Direct Secret Commits:** All API keys, endpoints, and credentials must live in environment variables or copyable `.example` config files.
