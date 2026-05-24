# MMA-Project Initialization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize a monorepo with two project folders — a React Native (Expo) mobile app and a Node.js backend with Firebase, MySQL, and Docker.

**Architecture:** Monorepo root at `MMA-Project/` containing `mobile/` (React Native Expo with file-based routing and feature-based modules) and `backend/` (Node.js + Express with layered architecture: controllers → services → models). Docker Compose orchestrates the backend and MySQL database. No build or run required — init only.

**Tech Stack:** React Native (Expo SDK 53), Node.js 22, Express, Firebase Admin SDK, MySQL 8.0 (mysql2), Docker & Docker Compose

---

## File Structure Overview

```
MMA-Project/
├── .gitignore
├── README.md
├── mobile/                          # React Native Expo app
│   ├── app/                         # Expo Router (file-based routing)
│   │   ├── _layout.tsx              # Root layout
│   │   ├── index.tsx                # Home screen
│   │   └── +not-found.tsx           # 404 screen
│   ├── assets/                      # Static assets (images, fonts)
│   ├── src/
│   │   ├── components/              # Shared UI components
│   │   ├── constants/               # App-wide constants
│   │   │   └── Colors.ts
│   │   ├── features/                # Feature-based modules
│   │   ├── hooks/                   # Shared custom hooks
│   │   ├── services/                # API clients, external services
│   │   ├── store/                   # Global state management
│   │   ├── types/                   # Shared TypeScript types
│   │   └── utils/                   # Helper functions
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── backend/                         # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.js             # Centralized env config
│   │   │   ├── firebase.js          # Firebase Admin init
│   │   │   └── database.js          # MySQL connection pool
│   │   ├── controllers/             # Request handlers
│   │   ├── services/                # Business logic
│   │   ├── models/                  # Data access layer
│   │   ├── routes/
│   │   │   └── index.js             # Route aggregator
│   │   ├── middleware/
│   │   │   └── error-handler.js     # Centralized error handler
│   │   ├── utils/                   # Shared helpers
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Server entry point
│   ├── .env.example                 # Environment variable template
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── docker-compose.yml
└── docs/
    └── superpowers/
        └── plans/
```

---

### Task 1: Root Monorepo Setup

**Files:**
- Create: `MMA-Project/.gitignore`
- Create: `MMA-Project/README.md`

- [x] **Step 1: Create root `.gitignore`**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/.gitignore`:

```gitignore
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Firebase service account key
**/serviceAccountKey.json

# Docker
docker-compose.override.yml

# Logs
*.log
npm-debug.log*
```

- [x] **Step 2: Create root `README.md`**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/README.md`:

~~~markdown
# MMA-Project

Monorepo containing the mobile app and backend API.

## Structure

| Folder     | Description                                    |
| ---------- | ---------------------------------------------- |
| `mobile/`  | React Native (Expo) mobile application         |
| `backend/` | Node.js + Express API with Firebase and MySQL  |

## Getting Started

### Mobile

```bash
cd mobile
npm install
npx expo start
```

### Backend

```bash
cd backend
docker compose up -d     # Start MySQL + backend
```

## Tech Stack

- **Mobile:** React Native, Expo SDK 53, TypeScript
- **Backend:** Node.js 22, Express, Firebase Admin SDK
- **Database:** MySQL 8.0
- **Infrastructure:** Docker, Docker Compose
~~~

- [x] **Step 3: Initialize git repo**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git init
git add .gitignore README.md
git commit -m "chore: init monorepo root"
```

Expected: Clean commit with 2 files.

---

### Task 2: Initialize React Native Expo App

**Files:**
- Create: `MMA-Project/mobile/` (via `create-expo-app`)

- [x] **Step 1: Scaffold Expo app**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
npx -y create-expo-app@latest mobile --yes
```

Expected: A new `mobile/` directory is created with the default Expo template, including `app/`, `assets/`, `package.json`, `tsconfig.json`, and `app.json`. Dependencies are installed automatically.

- [x] **Step 2: Commit the scaffolded Expo app**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add mobile/
git commit -m "feat(mobile): scaffold Expo app with create-expo-app"
```

Expected: Clean commit with all Expo template files.

---

### Task 3: Create Mobile App Source Structure

**Files:**
- Create: `MMA-Project/mobile/src/components/.gitkeep`
- Create: `MMA-Project/mobile/src/constants/Colors.ts`
- Create: `MMA-Project/mobile/src/features/.gitkeep`
- Create: `MMA-Project/mobile/src/hooks/.gitkeep`
- Create: `MMA-Project/mobile/src/services/.gitkeep`
- Create: `MMA-Project/mobile/src/store/.gitkeep`
- Create: `MMA-Project/mobile/src/types/.gitkeep`
- Create: `MMA-Project/mobile/src/utils/.gitkeep`

- [x] **Step 1: Create feature-based folder structure**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
mkdir -p mobile/src/{components,constants,features,hooks,services,store,types,utils}
```

- [x] **Step 2: Create `.gitkeep` files for empty directories**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
for dir in components features hooks services store types utils; do
  touch "mobile/src/$dir/.gitkeep"
done
```

- [x] **Step 3: Create `Colors.ts` constants file**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/mobile/src/constants/Colors.ts`:

```typescript
/**
 * App color palette.
 * Usage: import { Colors } from '@/src/constants/Colors';
 */
export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: '#0A7EA4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0A7EA4',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
  },
};
```

- [x] **Step 4: Commit mobile source structure**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add mobile/src/
git commit -m "feat(mobile): add feature-based source structure"
```

Expected: Clean commit with `.gitkeep` files and `Colors.ts`.

---

### Task 4: Initialize Backend Node.js Project

**Files:**
- Create: `MMA-Project/backend/package.json`
- Create: `MMA-Project/backend/.env.example`

- [x] **Step 1: Initialize Node.js project**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
mkdir -p backend
cd backend && npm init -y
```

Expected: `backend/package.json` is created with default values.

- [x] **Step 2: Update `package.json` with correct metadata and ESM**

Overwrite `/Volumes/Data/Code/study/MMA/MMA-Project/backend/package.json`:

```json
{
  "name": "mma-backend",
  "version": "1.0.0",
  "description": "MMA Project Backend API — Node.js, Express, Firebase, MySQL",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

- [x] **Step 3: Install backend dependencies**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project/backend`:

```bash
npm install express mysql2 firebase-admin dotenv cors
```

Expected: `node_modules/` created, `package-lock.json` updated, dependencies in `package.json`.

- [x] **Step 4: Create `.env.example`**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=mma_user
DB_PASSWORD=your_password_here
DB_NAME=mma_db

# Firebase — paste the JSON content of your service account key
FIREBASE_SERVICE_ACCOUNT='{}'
```

- [x] **Step 5: Commit backend init**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add backend/package.json backend/package-lock.json backend/.env.example
git commit -m "feat(backend): init Node.js project with dependencies"
```

Expected: Clean commit. `node_modules/` should NOT be committed (covered by root `.gitignore`).

---

### Task 5: Backend Source — Config Layer

**Files:**
- Create: `MMA-Project/backend/src/config/index.js`
- Create: `MMA-Project/backend/src/config/firebase.js`
- Create: `MMA-Project/backend/src/config/database.js`

- [x] **Step 1: Create directory structure**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
mkdir -p backend/src/{config,controllers,services,models,routes,middleware,utils}
```

- [x] **Step 2: Create centralized config `index.js`**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/config/index.js`:

```javascript
import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'mma_user',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'mma_db',
  },
  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null,
  },
};

export default config;
```

- [x] **Step 3: Create Firebase config**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/config/firebase.js`:

```javascript
import admin from 'firebase-admin';
import config from './index.js';

let firebaseApp;

if (config.firebase.serviceAccount) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(config.firebase.serviceAccount),
  });
  console.log('✅ Firebase Admin initialized');
} else {
  console.warn('⚠️  Firebase service account not configured — skipping init');
}

export { admin, firebaseApp };
```

- [x] **Step 4: Create MySQL database config**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/config/database.js`:

```javascript
import mysql from 'mysql2/promise';
import config from './index.js';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Test the database connection.
 * Call this once at server startup.
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    throw error;
  }
}

export default pool;
```

- [x] **Step 5: Commit config layer**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add backend/src/
git commit -m "feat(backend): add config layer (env, firebase, mysql)"
```

Expected: Clean commit with 3 config files and empty directories.

---

### Task 6: Backend Source — Express App & Server

**Files:**
- Create: `MMA-Project/backend/src/middleware/error-handler.js`
- Create: `MMA-Project/backend/src/routes/index.js`
- Create: `MMA-Project/backend/src/app.js`
- Create: `MMA-Project/backend/src/server.js`

- [x] **Step 1: Create error handler middleware**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/middleware/error-handler.js`:

```javascript
/**
 * Centralized error handling middleware.
 * Must be registered LAST in the middleware chain.
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${status} - ${message}`);

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
    },
  });
}
```

- [x] **Step 2: Create route aggregator**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/routes/index.js`:

```javascript
import { Router } from 'express';

const router = Router();

/**
 * Health check endpoint.
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Register feature routes here:
// import authRoutes from './auth.js';
// router.use('/auth', authRoutes);

export default router;
```

- [x] **Step 3: Create Express app setup**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/app.js`:

```javascript
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import errorHandler from './middleware/error-handler.js';

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api', routes);

// --- Error Handler (must be last) ---
app.use(errorHandler);

export default app;
```

- [x] **Step 4: Create server entry point**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/server.js`:

```javascript
import app from './app.js';
import config from './config/index.js';
import { testConnection } from './config/database.js';
import './config/firebase.js';

const start = async () => {
  try {
    // Test DB connection at startup
    await testConnection();

    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
```

- [x] **Step 5: Add `.gitkeep` files for empty source directories**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
for dir in controllers services models utils; do
  touch "backend/src/$dir/.gitkeep"
done
```

- [x] **Step 6: Commit app and server**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add backend/src/
git commit -m "feat(backend): add Express app, server, routes, error handler"
```

Expected: Clean commit with `app.js`, `server.js`, `routes/index.js`, `middleware/error-handler.js`, and `.gitkeep` files.

---

### Task 7: Docker Setup

**Files:**
- Create: `MMA-Project/backend/Dockerfile`
- Create: `MMA-Project/backend/.dockerignore`
- Create: `MMA-Project/backend/docker-compose.yml`

- [x] **Step 1: Create `.dockerignore`**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/.dockerignore`:

```dockerignore
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
docker-compose.yml
docker-compose.override.yml
Dockerfile
.dockerignore
README.md
docs
```

- [x] **Step 2: Create `Dockerfile`**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/Dockerfile`:

```dockerfile
# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Production ----
FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
USER appuser
EXPOSE 3000
CMD ["node", "src/server.js"]
```

- [x] **Step 3: Create `docker-compose.yml`**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/docker-compose.yml`:

```yaml
services:
  # --- MySQL Database ---
  mysqldb:
    image: mysql:8.0
    container_name: mma-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: ${DB_NAME:-mma_db}
      MYSQL_USER: ${DB_USER:-mma_user}
      MYSQL_PASSWORD: ${DB_PASSWORD:-mma_password}
    ports:
      - "${DB_PORT:-3306}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - mma-network

  # --- Backend API ---
  api:
    build:
      context: .
      target: production
    container_name: mma-api
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:3000"
    environment:
      PORT: 3000
      NODE_ENV: ${NODE_ENV:-development}
      DB_HOST: mysqldb
      DB_PORT: 3306
      DB_USER: ${DB_USER:-mma_user}
      DB_PASSWORD: ${DB_PASSWORD:-mma_password}
      DB_NAME: ${DB_NAME:-mma_db}
      FIREBASE_SERVICE_ACCOUNT: ${FIREBASE_SERVICE_ACCOUNT:-'{}'}
    depends_on:
      mysqldb:
        condition: service_healthy
    networks:
      - mma-network

networks:
  mma-network:
    driver: bridge

volumes:
  mysql_data:
```

- [x] **Step 4: Update `.env.example` with Docker-specific vars**

Overwrite `/Volumes/Data/Code/study/MMA/MMA-Project/backend/.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# MySQL
MYSQL_ROOT_PASSWORD=rootpassword
DB_HOST=localhost
DB_PORT=3306
DB_USER=mma_user
DB_PASSWORD=mma_password
DB_NAME=mma_db

# Firebase — paste the JSON content of your service account key
FIREBASE_SERVICE_ACCOUNT='{}'
```

- [x] **Step 5: Commit Docker setup**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add backend/Dockerfile backend/.dockerignore backend/docker-compose.yml backend/.env.example
git commit -m "feat(backend): add Docker and Docker Compose setup"
```

Expected: Clean commit with 4 files.

---

### Task 8: Final Verification & Cleanup

**Files:**
- No new files

- [x] **Step 1: Verify the full file tree**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
find . -not -path './mobile/node_modules/*' -not -path './backend/node_modules/*' -not -path './.git/*' | head -80
```

Expected output should match the file structure outlined at the top of this plan.

- [x] **Step 2: Verify backend `package.json` has all dependencies**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project/backend`:

```bash
node -e "const p = JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log(Object.keys(p.dependencies).sort().join(', '))"
```

Expected: `cors, dotenv, express, firebase-admin, mysql2`

- [x] **Step 3: Verify mobile `package.json` exists and has Expo**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project/mobile`:

```bash
node -e "const p = JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('name:', p.name); console.log('expo:', p.dependencies.expo)"
```

Expected: Project name and Expo version printed.

- [x] **Step 4: Final commit log check**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git log --oneline
```

Expected: Commits in order:
1. `chore: init monorepo root`
2. `feat(mobile): scaffold Expo app with create-expo-app`
3. `feat(mobile): add feature-based source structure`
4. `feat(backend): init Node.js project with dependencies`
5. `feat(backend): add config layer (env, firebase, mysql)`
6. `feat(backend): add Express app, server, routes, error handler`
7. `feat(backend): add Docker and Docker Compose setup`
