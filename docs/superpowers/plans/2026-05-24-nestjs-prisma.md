# Migrate Backend from Express to NestJS with Prisma ORM Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Express backend with NestJS + Prisma ORM, configuring it for Firebase Admin SDK and MySQL database, setup with Docker Compose.

**Architecture:** Use NestJS CLI to initialize the project in `backend/`. Configure Prisma Client inside a dedicated NestJS Database module. Provide config services for environment variables. Setup Docker Compose to orchestrate MySQL and the NestJS backend API.

**Tech Stack:** NestJS, TypeScript, Prisma ORM, Firebase Admin SDK, MySQL 8.0, Docker

---

## File Structure Overview

```
backend/
├── prisma/
│   └── schema.prisma        # Prisma Schema
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts              # NestJS Entry point
│   ├── config/
│   │   ├── config.module.ts # Centralized Config module
│   │   └── config.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts # Prisma service & module
│   │   └── prisma.service.ts
│   └── firebase/
│       ├── firebase.module.ts # Firebase Admin SDK module
│       └── firebase.service.ts
├── .env.example
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

### Task 1: Clean Express Backend and Scaffold NestJS App

**Files:**
- Modify: `backend/*` (delete old files and scaffold new ones)

- [x] **Step 1: Clean up the existing Express backend directory**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
rm -rf backend
```

- [x] **Step 2: Scaffold NestJS application**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
npx -y @nestjs/cli@latest new backend --directory backend --package-manager npm --skip-git
```

Expected: A fresh NestJS project scaffolded in `backend/` using `npm` package manager, skipping git initialization inside the subdirectory.

- [x] **Step 3: Commit initial NestJS scaffold**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add backend/
git commit -m "chore(backend): scaffold NestJS project with Nest CLI"
```

---

### Task 2: Install Prisma and Additional Backend Dependencies

**Files:**
- Modify: `backend/package.json`

- [x] **Step 1: Install dev dependencies for Prisma and Firebase**

Since the local Node.js engine is 22.11.0, we will install `prisma@6` to satisfy engine version checks (which supports Node 22.11.0).

Run from `/Volumes/Data/Code/study/MMA/MMA-Project/backend`:

```bash
npm install prisma@6 --save-dev
```

- [x] **Step 2: Install runtime dependencies**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project/backend`:

```bash
npm install @prisma/client@6 firebase-admin @nestjs/config dotenv
```

- [x] **Step 3: Add prisma scripts in package.json**

Modify `backend/package.json` to include:

```json
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
```

- [x] **Step 4: Commit dependencies**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add backend/package.json backend/package-lock.json
git commit -m "chore(backend): install prisma client, firebase-admin and config dependencies"
```

---

### Task 3: Initialize Prisma Schema & Connection Service

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/prisma/prisma.service.ts`
- Create: `backend/src/prisma/prisma.module.ts`

- [x] **Step 1: Create Prisma schema**

Create directory `backend/prisma/` and file `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- [x] **Step 2: Generate Prisma Client locally**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project/backend`:

```bash
npx prisma generate
```

- [x] **Step 3: Create Prisma Service**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Connected to database via Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- [x] **Step 4: Create Prisma Module**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/prisma/prisma.module.ts`:

```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [x] **Step 5: Commit Prisma configuration**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add backend/prisma/schema.prisma backend/src/prisma/
git commit -m "feat(backend): configure Prisma module and service"
```

---

### Task 4: Configure NestJS Environment and Firebase Admin SDK

**Files:**
- Create: `backend/src/config/config.service.ts`
- Create: `backend/src/config/config.module.ts`
- Create: `backend/src/firebase/firebase.service.ts`
- Create: `backend/src/firebase/firebase.module.ts`
- Create: `backend/.env.example`

- [x] **Step 1: Create Centralized Config Service**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/config/config.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }

  get firebaseServiceAccount(): string {
    return this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
  }
}
```

- [x] **Step 2: Create Centralized Config Module**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/config/config.module.ts`:

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
```

- [x] **Step 3: Create Firebase Admin SDK Service**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/firebase/firebase.service.ts`:

```typescript
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: AppConfigService) {}

  onModuleInit() {
    const serviceAccountStr = this.configService.firebaseServiceAccount;
    if (serviceAccountStr && serviceAccountStr !== '{}') {
      try {
        const serviceAccount = JSON.parse(serviceAccountStr);
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('✅ Firebase Admin SDK initialized successfully');
      } catch (error) {
        this.logger.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
      }
    } else {
      this.logger.warn('⚠️  Firebase service account key not provided. Skipping initialization.');
    }
  }

  getAdmin() {
    return admin;
  }

  getApp() {
    return this.firebaseApp;
  }
}
```

- [x] **Step 4: Create Firebase Module**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/firebase/firebase.module.ts`:

```typescript
import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
```

- [x] **Step 5: Create `.env.example`**

Create file `/Volumes/Data/Code/study/MMA/MMA-Project/backend/.env.example`:

```env
PORT=3000
NODE_ENV=development

# MySQL
MYSQL_ROOT_PASSWORD=rootpassword
DB_HOST=localhost
DB_PORT=3306
DB_USER=mma_user
DB_PASSWORD=mma_password
DB_NAME=mma_db

# Database Connection URL (used by Prisma)
DATABASE_URL="mysql://mma_user:mma_password@localhost:3306/mma_db"

# Firebase Service Account JSON (stringified)
FIREBASE_SERVICE_ACCOUNT='{}'
```

- [x] **Step 6: Integrate everything into App Module**

Overwrite `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [AppConfigModule, PrismaModule, FirebaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [x] **Step 7: Update NestJS Main/Bootstrap Server**

Overwrite `/Volumes/Data/Code/study/MMA/MMA-Project/backend/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Prefix all routes with /api
  app.setGlobalPrefix('api');

  const configService = app.get(AppConfigService);
  const port = configService.port;

  await app.listen(port);
  console.log(`🚀 NestJS Server running on: http://localhost:${port}/api`);
}
bootstrap();
```

- [x] **Step 8: Commit configuration and integrations**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add backend/src/config/ backend/src/firebase/ backend/src/app.module.ts backend/src/main.ts backend/.env.example
git commit -m "feat(backend): add config module, firebase module and bootstrap main entry point"
```

---

### Task 5: Configure Docker & Docker Compose for NestJS and Prisma

**Files:**
- Create: `backend/.dockerignore`
- Create: `backend/Dockerfile`
- Create: `backend/docker-compose.yml`

- [x] **Step 1: Create `.dockerignore`**

Create `/Volumes/Data/Code/study/MMA/MMA-Project/backend/.dockerignore`:

```dockerignore
node_modules
npm-debug.log
dist
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

- [x] **Step 2: Create NestJS Dockerfile**

Create `/Volumes/Data/Code/study/MMA/MMA-Project/backend/Dockerfile`:

```dockerfile
# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma/ ./prisma/
RUN npm ci && npx prisma generate

# ---- Build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---- Production ----
FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

- [x] **Step 3: Create `docker-compose.yml`**

Create `/Volumes/Data/Code/study/MMA/MMA-Project/backend/docker-compose.yml`:

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

  # --- NestJS Backend API ---
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
      DATABASE_URL: mysql://${DB_USER:-mma_user}:${DB_PASSWORD:-mma_password}@mysqldb:3306/${DB_NAME:-mma_db}
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

- [x] **Step 4: Commit Docker configs**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add backend/Dockerfile backend/.dockerignore backend/docker-compose.yml
git commit -m "feat(backend): add Dockerfile and Docker Compose configurations for NestJS and Prisma"
```

---

### Task 6: Final Verification & Cleanup

**Files:**
- No new files

- [x] **Step 1: Verify file tree**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
find backend -maxdepth 3 -not -path '*/node_modules*' -not -path '*/dist*' | sort
```

- [x] **Step 2: Verify package.json contains all dependencies**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project/backend`:

```bash
node -e "const p = JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('dependencies:', Object.keys(p.dependencies).join(', ')); console.log('devDependencies:', Object.keys(p.devDependencies).join(', '))"
```

Expected output:
dependencies: `@nestjs/common`, `@nestjs/config`, `@nestjs/core`, `@nestjs/platform-express`, `@prisma/client`, `dotenv`, `firebase-admin`, `reflect-metadata`, `rxjs`
devDependencies: `prisma`

- [x] **Step 3: Validate schema.prisma**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project/backend`:

```bash
npx prisma validate
```

Expected: The schema is valid.

- [x] **Step 4: Commit this plan**

Run from `/Volumes/Data/Code/study/MMA/MMA-Project`:

```bash
git add docs/superpowers/plans/2026-05-24-nestjs-prisma.md
git commit -m "docs: add plan for NestJS and Prisma integration"
```
