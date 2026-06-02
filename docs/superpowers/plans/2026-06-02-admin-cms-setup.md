# Admin CMS Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize a React + TypeScript Vite project with Tailwind CSS v3, shadcn/ui configuration, React Router v6, Axios, and a best-practice feature-based folder structure.

**Architecture:** Initialize the application inside `/admin-cms`, configure TypeScript and Vite path mapping (`@/*`), set up the Tailwind CSS v3 styling, initialize the shadcn/ui framework structure, generate boilerplate layouts/pages, and add routing & API client logic.

**Tech Stack:** React 18+, Vite, TypeScript, Tailwind CSS v3, shadcn/ui, React Router v6, Axios.

---

### Task 1: Scaffolding Vite App & Path Aliasing

**Files:**
- Create: `admin-cms/vite.config.ts`
- Create: `admin-cms/tsconfig.json`
- Create: `admin-cms/tsconfig.app.json`

- [ ] **Step 1: Scaffolding the React + TypeScript app**
  Run: `npx -y create-vite@latest admin-cms --template react-ts`
  Expected: Successful initialization of the `admin-cms` directory under the root project directory.

- [ ] **Step 2: Install node type definitions**
  Run: `npm --prefix admin-cms install -D @types/node`
  Expected: Node types installed under `admin-cms/node_modules/`.

- [ ] **Step 3: Update `admin-cms/vite.config.ts` to support `@/*` path mapping**
  Overwrite the contents of `admin-cms/vite.config.ts` to:
  ```typescript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import path from 'path';

  // https://vitejs.dev/config/
  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  });
  ```

- [ ] **Step 4: Update tsconfig configs to support `@/*` path mapping**
  Overwrite `admin-cms/tsconfig.json` to:
  ```json
  {
    "files": [],
    "references": [
      { "path": "./tsconfig.app.json" },
      { "path": "./tsconfig.node.json" }
    ]
  }
  ```
  Overwrite `admin-cms/tsconfig.app.json` to:
  ```json
  {
    "compilerOptions": {
      "composite": true,
      "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["DOM", "DOM.Iterable", "ES2020"],
      "module": "ESNext",
      "skipLibCheck": true,

      /* Bundler mode */
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "moduleDetection": "force",
      "noEmit": true,
      "jsx": "react-jsx",

      /* Linting */
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,

      /* Path Alias */
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    },
    "include": ["src"]
  }
  ```

- [ ] **Step 5: Run compilation check to verify aliases & configuration**
  Run: `npm --prefix admin-cms run build`
  Expected: Successfully builds without TypeScript compilation or Vite errors.

- [ ] **Step 6: Commit**
  Run:
  ```bash
  git add admin-cms/vite.config.ts admin-cms/tsconfig.json admin-cms/tsconfig.app.json admin-cms/package.json
  git commit -m "feat: scaffold vite app and configure path aliasing"
  ```

---

### Task 2: Setup Tailwind CSS v3

**Files:**
- Create: `admin-cms/tailwind.config.js`
- Create: `admin-cms/postcss.config.js`
- Modify: `admin-cms/src/index.css`

- [ ] **Step 1: Install Tailwind CSS dependencies**
  Run: `npm --prefix admin-cms install -D tailwindcss@3.4.1 postcss@8.4.38 autoprefixer@10.4.19`
  Expected: Tailwind CSS and its support tools are added to `devDependencies` in `admin-cms/package.json`.

- [ ] **Step 2: Create `admin-cms/postcss.config.js`**
  Write:
  ```javascript
  export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
  ```

- [ ] **Step 3: Create `admin-cms/tailwind.config.js`**
  Write:
  ```javascript
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  ```

- [ ] **Step 4: Update `admin-cms/src/index.css` to import Tailwind directives**
  Overwrite `admin-cms/src/index.css` to:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  :root {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
  }
  ```

- [ ] **Step 5: Run a test build to ensure Tailwind compiles correctly**
  Run: `npm --prefix admin-cms run build`
  Expected: Successfully builds with CSS compilation.

- [ ] **Step 6: Commit**
  Run:
  ```bash
  git add admin-cms/tailwind.config.js admin-cms/postcss.config.js admin-cms/src/index.css
  git commit -m "feat: configure tailwind css v3"
  ```

---

### Task 3: Configure shadcn/ui

**Files:**
- Create: `admin-cms/components.json`
- Create: `admin-cms/src/lib/utils.ts`
- Modify: `admin-cms/src/index.css`

- [ ] **Step 1: Install auxiliary styling packages**
  Run: `npm --prefix admin-cms install clsx tailwind-merge lucide-react`
  Expected: Helper packages for component classes are installed.

- [ ] **Step 2: Create shadcn utility helper `admin-cms/src/lib/utils.ts`**
  Write:
  ```typescript
  import { type ClassValue, clsx } from "clsx";
  import { twMerge } from "tailwind-merge";

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

- [ ] **Step 3: Create `admin-cms/components.json`**
  Write:
  ```json
  {
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "default",
    "rsc": false,
    "tsx": true,
    "tailwind": {
      "config": "tailwind.config.js",
      "css": "src/index.css",
      "baseColor": "slate",
      "cssVariables": true,
      "prefix": ""
    },
    "aliases": {
      "components": "@/components",
      "utils": "@/lib/utils",
      "ui": "@/components/ui",
      "lib": "@/lib",
      "hooks": "@/hooks"
    }
  }
  ```

- [ ] **Step 4: Update Tailwind Config with shadcn theme tokens**
  Overwrite `admin-cms/tailwind.config.js` to:
  ```javascript
  /** @type {import('tailwindcss').Config} */
  export default {
    darkMode: ["class"],
    content: [
      './pages/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}',
      './src/**/*.{ts,tsx}',
    ],
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
      },
    },
    plugins: [],
  };
  ```

- [ ] **Step 5: Add CSS Variables to `admin-cms/src/index.css`**
  Append these variables to the top of `admin-cms/src/index.css`:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;

      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;

      --popover: 0 0% 100%;
      --popover-foreground: 222.2 84% 4.9%;

      --primary: 222.2 47.4% 11.2%;
      --primary-foreground: 210 40% 98%;

      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;

      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;

      --accent: 210 40% 96.1%;
      --accent-foreground: 222.2 47.4% 11.2%;

      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 210 40% 98%;

      --border: 214.3 31.8% 91.4%;
      --input: 214.3 31.8% 91.4%;
      --ring: 222.2 84% 4.9%;

      --radius: 0.5rem;
    }

    .dark {
      --background: 222.2 84% 4.9%;
      --foreground: 210 40% 98%;

      --card: 222.2 84% 4.9%;
      --card-foreground: 210 40% 98%;

      --popover: 222.2 84% 4.9%;
      --popover-foreground: 210 40% 98%;

      --primary: 210 40% 98%;
      --primary-foreground: 222.2 47.4% 11.2%;

      --secondary: 217.2 32.6% 17.5%;
      --secondary-foreground: 210 40% 98%;

      --muted: 217.2 32.6% 17.5%;
      --muted-foreground: 215 20.2% 65.1%;

      --accent: 217.2 32.6% 17.5%;
      --accent-foreground: 210 40% 98%;

      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 210 40% 98%;

      --border: 217.2 32.6% 17.5%;
      --input: 217.2 32.6% 17.5%;
      --ring: 212.7 26.8% 83.9%;
    }
  }

  @layer base {
    * {
      @apply border-border;
    }
    body {
      @apply bg-background text-foreground;
    }
  }
  ```

- [ ] **Step 6: Verify config compiles**
  Run: `npm --prefix admin-cms run build`
  Expected: Successfully builds without compile-time errors.

- [ ] **Step 7: Commit**
  Run:
  ```bash
  git add admin-cms/components.json admin-cms/src/lib/utils.ts admin-cms/tailwind.config.js admin-cms/src/index.css
  git commit -m "feat: initialize shadcn configuration"
  ```

---

### Task 4: Folder Structure Setup & Core Layouts/Pages

**Files:**
- Create: `admin-cms/src/layouts/AuthLayout.tsx`
- Create: `admin-cms/src/layouts/DashboardLayout.tsx`
- Create: `admin-cms/src/features/auth/pages/LoginPage.tsx`
- Create: `admin-cms/src/features/dashboard/pages/DashboardOverviewPage.tsx`

- [ ] **Step 1: Create directories for best-practice folder structure**
  Run:
  ```bash
  mkdir -p admin-cms/src/assets admin-cms/src/components/ui admin-cms/src/features/auth/components admin-cms/src/features/auth/pages admin-cms/src/features/dashboard/components admin-cms/src/features/dashboard/pages admin-cms/src/hooks admin-cms/src/layouts admin-cms/src/routes admin-cms/src/services admin-cms/src/types
  ```
  Expected: Directories are created successfully.

- [ ] **Step 2: Create Auth Layout (`admin-cms/src/layouts/AuthLayout.tsx`)**
  Write:
  ```tsx
  import React from 'react';
  import { Outlet } from 'react-router-dom';

  export default function AuthLayout() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md border border-slate-100">
          <Outlet />
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Create Dashboard Layout (`admin-cms/src/layouts/DashboardLayout.tsx`)**
  Write:
  ```tsx
  import React from 'react';
  import { Outlet, Link, useNavigate } from 'react-router-dom';

  export default function DashboardLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
      localStorage.removeItem('admin_token');
      navigate('/login');
    };

    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <span className="text-xl font-bold tracking-wider">MMA Admin</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            <Link to="/" className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-slate-800 text-white">
              Dashboard
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <h1 className="text-lg font-semibold text-slate-800">System Dashboard</h1>
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Create Login Page (`admin-cms/src/features/auth/pages/LoginPage.tsx`)**
  Write:
  ```tsx
  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';

  export default function LoginPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      localStorage.setItem('admin_token', 'mock_admin_token');
      navigate('/');
    };

    return (
      <div className="w-full">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign in to Admin</h2>
          <p className="mt-2 text-sm text-slate-600">Enter mock credentials to access the panel</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue="admin@mma.com"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                defaultValue="password"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    );
  }
  ```

- [ ] **Step 5: Create Dashboard Overview Page (`admin-cms/src/features/dashboard/pages/DashboardOverviewPage.tsx`)**
  Write:
  ```tsx
  import React from 'react';

  export default function DashboardOverviewPage() {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">Welcome to MMA Admin Panel</h2>
          <p className="mt-1 text-sm text-slate-500">Select an item from the sidebar to manage features.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
            <div className="p-5">
              <div className="text-sm font-medium text-slate-500 truncate">Total Bookings</div>
              <div className="mt-1 text-3xl font-semibold text-slate-900">0</div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
            <div className="p-5">
              <div className="text-sm font-medium text-slate-500 truncate">Active Drivers</div>
              <div className="mt-1 text-3xl font-semibold text-slate-900">0</div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
            <div className="p-5">
              <div className="text-sm font-medium text-slate-500 truncate">Total Users</div>
              <div className="mt-1 text-3xl font-semibold text-slate-900">0</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 6: Build check**
  Run: `npm --prefix admin-cms run build`
  Expected: Successfully builds all pages and layouts.

- [ ] **Step 7: Commit**
  Run:
  ```bash
  git add admin-cms/src/layouts admin-cms/src/features
  git commit -m "feat: implement boilerplate layouts and feature pages"
  ```

---

### Task 5: Setup Routing (React Router v6)

**Files:**
- Create: `admin-cms/src/routes/index.tsx`
- Modify: `admin-cms/src/App.tsx`
- Modify: `admin-cms/src/main.tsx`

- [ ] **Step 1: Install React Router**
  Run: `npm --prefix admin-cms install react-router-dom`
  Expected: React Router package added to dependencies in `admin-cms/package.json`.

- [ ] **Step 2: Create routing mapping `admin-cms/src/routes/index.tsx`**
  Write:
  ```tsx
  import React from 'react';
  import { Navigate, Outlet } from 'react-router-dom';
  import DashboardLayout from '@/layouts/DashboardLayout';
  import AuthLayout from '@/layouts/AuthLayout';
  import LoginPage from '@/features/auth/pages/LoginPage';
  import DashboardOverviewPage from '@/features/dashboard/pages/DashboardOverviewPage';

  const ProtectedRoute = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return <Outlet />;
  };

  export const routes = [
    {
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <LoginPage /> },
      ],
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <DashboardLayout />,
          children: [
            { path: '/', element: <DashboardOverviewPage /> },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ];
  ```

- [ ] **Step 3: Update `admin-cms/src/App.tsx`**
  Overwrite `admin-cms/src/App.tsx` to:
  ```tsx
  import React from 'react';
  import { createBrowserRouter, RouterProvider } from 'react-router-dom';
  import { routes } from '@/routes';

  const router = createBrowserRouter(routes);

  function App() {
    return <RouterProvider router={router} />;
  }

  export default App;
  ```

- [ ] **Step 4: Update `admin-cms/src/main.tsx`**
  Overwrite `admin-cms/src/main.tsx` to:
  ```tsx
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App.tsx';
  import './index.css';

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  ```

- [ ] **Step 5: Verify build works**
  Run: `npm --prefix admin-cms run build`
  Expected: Successfully builds.

- [ ] **Step 6: Commit**
  Run:
  ```bash
  git add admin-cms/src/routes admin-cms/src/App.tsx admin-cms/src/main.tsx
  git commit -m "feat: implement routing with react router v6"
  ```

---

### Task 6: Pre-configure Axios Client

**Files:**
- Create: `admin-cms/src/lib/axios.ts`
- Create: `admin-cms/.env.example`

- [ ] **Step 1: Install Axios**
  Run: `npm --prefix admin-cms install axios`
  Expected: Axios installed as a production dependency.

- [ ] **Step 2: Create Axios client `admin-cms/src/lib/axios.ts`**
  Write:
  ```typescript
  import axios from 'axios';

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Attach token interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('admin_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Error interceptor (e.g. auth redirect)
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  export default axiosInstance;
  ```

- [ ] **Step 3: Create `admin-cms/.env.example`**
  Write:
  ```env
  VITE_API_URL=http://localhost:3000/api
  ```

- [ ] **Step 4: Verify full build**
  Run: `npm --prefix admin-cms run build`
  Expected: Clean build of the entire project.

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add admin-cms/src/lib/axios.ts admin-cms/.env.example
  git commit -m "feat: configure axios client with interceptors"
  ```
