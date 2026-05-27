# Onboarding & Authentication Design Specification

This specification defines the architecture, user flows, and styling implementation for the onboarding, authentication, and role-based dashboard screens in the mobile application.

---

## 1. Goal

Implement a secure, high-fidelity onboarding and login/signup flow integrating **Firebase Authentication** and syncing state with the backend. After authentication, users are redirected to distinct dashboards based on their role: **Passengers** get access to their travel dashboard, and **Admins** get access to their operations dashboard.

---

## 2. Architecture Overview

We will establish a secure, centralized authentication state machine at the root of the React Native application.

```mermaid
graph TD
    A[App Root _layout.tsx] --> B(AuthProvider)
    B --> C{auth.currentUser?}
    C -->|No| D[(auth) Stack Route]
    C -->|Yes| E{user.role?}
    D --> D1[Onboarding Screen]
    D --> D2[Login Screen]
    D --> D3[Register Screen]
    E -->|passenger| F[(passenger) Tab Router]
    E -->|admin| G[(admin) Tab Router]
    F --> F1[Discover/Dashboard]
    F --> F2[Favorites]
    F --> F3[Bookings]
    F --> F4[Messages]
    G --> G1[Overview/Dashboard]
    G --> G2[Chats]
    G --> G3[Settings]
```

### Components Summary

1. **`AuthContext` (`src/context/auth-context.tsx`)**
   - Direct integration with Firebase SDK via `onAuthStateChanged`.
   - Bridges Firebase credentials with local backend resources using `authService.syncUser()` and `authService.adminLogin()`.
   - Exposes reactive variables (`user`, `firebaseUser`, `isLoading`) and functional triggers (`login`, `register`, `logout`).

2. **Conditional Tab Routers (`(passenger)` and `(admin)`)**
   - Replaces the generic `AppTabs` with modular bottom tab bars tailored for passenger layouts and admin actions.
   - Keeps both dashboards separate, secure, and clean.

---

## 3. UI/UX & Styling Specification

All screens will be implemented in styled TypeScript using **NativeWind v4** (TailwindCSS for React Native), matching the reference layouts:

* **Onboarding Screen**:
  * Scenic background image cover.
  * Bottom sheet card using clean absolute positioning.
  * Three custom social/credential pill buttons with inline vector icons.
* **Login & Registration Screens**:
  * Custom horizontal tab-switcher for passenger vs. admin selection (`Hành khách` / `Quản trị viên`).
  * Structured form input fields (floating border layouts, visibility toggles for passwords).
  * Divider text overlay for alternate authentication options (Google OAuth).
  * High contrast black main action button.

---

## 4. File Structure Impact

The following files will be added or modified:

### Created Files
* **`src/context/auth-context.tsx`**: React context provider managing auth state.
* **`src/app/(auth)/onboarding.tsx`**: Entry onboarding view.
* **`src/app/(auth)/login.tsx`**: Login page.
* **`src/app/(auth)/register.tsx`**: Sign-up page.
* **`src/app/(passenger)/_layout.tsx`**: Tab configuration for passenger navigation.
* **`src/app/(passenger)/index.tsx`**: Passenger home screen.
* **`src/app/(passenger)/favorites.tsx`**: Favorites placeholder.
* **`src/app/(passenger)/bookings.tsx`**: Bookings placeholder.
* **`src/app/(passenger)/messages.tsx`**: Messages placeholder.
* **`src/app/(admin)/_layout.tsx`**: Tab configuration for admin navigation.
* **`src/app/(admin)/index.tsx`**: Admin home screen.
* **`src/app/(admin)/chats.tsx`**: Admin chats placeholder.
* **`src/app/(admin)/settings.tsx`**: Admin settings placeholder.

### Modified Files
* **`src/app/_layout.tsx`**: Configure root loading screen and inject `AuthProvider`.
* **`src/app/index.tsx`**: Repurposed as a loading or redirect anchor.
* **`src/app/explore.tsx`**: Removed or relocated inside `(passenger)/` group.
* **`src/components/app-tabs.tsx`**: Updated or removed since custom bottom navigations will be group-specific.

---

## 5. Security & Error Handling

* **Token Sync**: All backend API endpoints are queried via `apiFetch`, which automatically appends `Authorization: Bearer <firebaseToken>` on logged-in requests.
* **Role Verification**: Admin users must succeed on the `/auth/admin/login` check. If their credentials are valid but lack administrative privileges in the backend, the login attempt fails and raises an permission error.
* **Form Validation**: Simple client-side constraints (valid email syntax, password matching, non-empty fields) will prevent incomplete form submissions.
