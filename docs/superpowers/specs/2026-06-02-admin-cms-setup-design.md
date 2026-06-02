# Design Spec: Admin CMS Setup

**Date:** 2026-06-02  
**Status:** Approved  
**Author:** Antigravity  

---

## 1. Objective
To initialize a modern, responsive, and scalable Admin CMS application inside the `/admin-cms` directory of the monorepo. The application will use React, TypeScript, Vite, Tailwind CSS v3, and shadcn/ui, with a modular, feature-based directory structure for maximum maintainability.

---

## 2. Tech Stack & Dependencies

- **Build Tool:** Vite
- **Framework:** React 18+
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3, PostCSS, Autoprefixer, Tailwind-merge, clsx, Lucide-react (icons)
- **Routing:** React Router v6 (`react-router-dom`)
- **HTTP Client:** Axios
- **Component Library:** shadcn/ui (configured with CSS variables)

---

## 3. Directory Structure (Feature-Based)

The folder structure is designed around product features under `src/features/` while keeping global components, layouts, hooks, and helpers modular and organized.

```
admin-cms/
├── .env.example
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── components.json
├── src/
│   ├── assets/           # Global static assets (logos, images, etc.)
│   ├── components/       # Global/reusable presentation components
│   │   └── ui/           # shadcn/ui components (e.g., button, card, input)
│   ├── features/         # Feature modules containing domain-specific files
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   └── pages/    # LoginPage, etc.
│   │   └── dashboard/
│   │       ├── components/
│   │       └── pages/    # DashboardOverviewPage, etc.
│   ├── hooks/            # Global custom React hooks
│   ├── layouts/          # Page layout wrappers (e.g., DashboardLayout, AuthLayout)
│   ├── lib/              # Configured library instances (e.g., axios.ts, utils.ts)
│   ├── routes/           # Routing configuration (routes list, auth guards)
│   ├── services/         # Global API fetchers & services
│   ├── types/            # Shared TypeScript declarations
│   ├── App.tsx           # Router provider integration
│   ├── index.css         # Tailwind directives & CSS variables
│   └── main.tsx          # App entrypoint
```

---

## 4. Key Configurations & Setup Details

### 4.1 Path Aliasing (`@/*`)
To avoid fragile relative imports like `../../components`, imports will use `@/` pointing directly to `src/`.
- **TypeScript:** Add `compilerOptions.paths: { "@/*": ["./src/*"] }` to tsconfig configs.
- **Vite:** Configure `resolve.alias` in `vite.config.ts` using `path.resolve` or `vite-tsconfig-paths`.

### 4.2 Tailwind CSS & shadcn/ui
- Initialize Tailwind v3 config with custom theme variables (primary, secondary, accent, destructive, border, input, etc.) linked to CSS variables in `src/index.css`.
- Configure `components.json` mapping shadcn imports to `@/components` and `@/lib/utils`.

### 4.3 Axios Instance
- Add `src/lib/axios.ts` exporting an Axios client configured with `baseURL` from environment variables (`import.meta.env.VITE_API_URL`).
- Add interceptors to attach the Bearer token (JWT) from localStorage on every request.

### 4.4 Routing Setup
- Pre-configure routes:
  - `/login`: Public auth login route.
  - `/`: Main dashboard route, protected by a simple client-side redirection guard if token is missing.
  - `*`: 404 handler page.

---

## 5. Verification Plan

1. **Build Verification:** Run `npm run build` to confirm compilation is error-free.
2. **Linting Check:** Run `npm run lint` if configured to verify clean code quality.
3. **Folder Check:** Ensure all specified folders are generated.
