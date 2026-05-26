# Firebase Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable NestJS backend to initialize the Firebase Admin SDK using either a local service account JSON file path or a stringified JSON environment variable.

**Architecture:** Modify `FirebaseService` to inspect the `FIREBASE_SERVICE_ACCOUNT` configuration. If it represents a JSON string, parse it; if it is a file path, load it using Node's `fs` module. Also, update `docker-compose.yml` to mount the credential file into the container if containerized development is used.

**Tech Stack:** NestJS, TypeScript, Firebase Admin SDK (`firebase-admin`), Node.js `fs` & `path` modules.

---

## Plan Details

### Task 1: Add Unit Tests for Firebase Service Path and JSON Loading

**Files:**
- Create: `backend/src/firebase/firebase.service.spec.ts`

- [ ] **Step 1: Write unit tests to verify JSON string and file path loading**
  Create `backend/src/firebase/firebase.service.spec.ts` with mock setups to test both pathways:
  ```typescript
  import { Test, TestingModule } from '@nestjs/testing';
  import { FirebaseService } from './firebase.service';
  import { AppConfigService } from '../config/config.service';
  import * as admin from 'firebase-admin';
  import * as fs from 'fs';
  import * as path from 'path';

  jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
  }));

  jest.mock('fs');

  describe('FirebaseService', () => {
    let service: FirebaseService;
    let configService: AppConfigService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FirebaseService,
          {
            provide: AppConfigService,
            useValue: {
              firebaseServiceAccount: '{}',
            },
          },
        ],
      }).compile();

      service = module.get<FirebaseService>(FirebaseService);
      configService = module.get<AppConfigService>(AppConfigService);
      jest.clearAllMocks();
    });

    it('should skip initialization if credentials are default or empty', () => {
      const loggerSpy = jest.spyOn(service['logger'], 'warn');
      service.onModuleInit();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Firebase service account key not provided'),
      );
      expect(admin.initializeApp).not.toHaveBeenCalled();
    });

    it('should initialize using raw JSON string if config starts with {', () => {
      const mockJson = '{"project_id": "test-project"}';
      jest.spyOn(configService, 'firebaseServiceAccount', 'get').mockReturnValue(mockJson);
      
      service.onModuleInit();

      expect(admin.credential.cert).toHaveBeenCalledWith(JSON.parse(mockJson));
      expect(admin.initializeApp).toHaveBeenCalled();
    });

    it('should initialize using file contents if config is a file path', () => {
      const mockPath = './serviceAccountKey.json';
      const mockFileContent = '{"project_id": "file-project"}';
      jest.spyOn(configService, 'firebaseServiceAccount', 'get').mockReturnValue(mockPath);
      
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockFileContent);

      service.onModuleInit();

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('serviceAccountKey.json'), 'utf8');
      expect(admin.credential.cert).toHaveBeenCalledWith(JSON.parse(mockFileContent));
      expect(admin.initializeApp).toHaveBeenCalled();
    });

    it('should log an error if the configured file path does not exist', () => {
      const mockPath = './missingKey.json';
      jest.spyOn(configService, 'firebaseServiceAccount', 'get').mockReturnValue(mockPath);
      
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const loggerSpy = jest.spyOn(service['logger'], 'error');

      service.onModuleInit();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize Firebase Admin SDK:'),
        expect.stringContaining('Firebase credentials file not found at'),
      );
      expect(admin.initializeApp).not.toHaveBeenCalled();
    });
  });
  ```

- [ ] **Step 2: Run tests to verify the new test file fails due to missing file path implementation**
  Run: `npm --prefix backend run test src/firebase/firebase.service.spec.ts`
  Expected: Failure on "should initialize using file contents if config is a file path" and "should log an error if the configured file path does not exist" tasks since path loading is not implemented yet.

---

### Task 2: Implement File Path Loading in Firebase Service

**Files:**
- Modify: `backend/src/firebase/firebase.service.ts`

- [ ] **Step 1: Update code to support reading from file paths**
  Modify `backend/src/firebase/firebase.service.ts` as specified in the design doc:
  ```typescript
  import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
  import * as admin from 'firebase-admin';
  import { AppConfigService } from '../config/config.service';
  import * as fs from 'fs';
  import * as path from 'path';

  @Injectable()
  export class FirebaseService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseService.name);
    private firebaseApp: admin.app.App;

    constructor(private configService: AppConfigService) {}

    onModuleInit() {
      const serviceAccountStr = this.configService.firebaseServiceAccount;
      if (serviceAccountStr && serviceAccountStr !== '{}') {
        try {
          let serviceAccount: admin.ServiceAccount;
          
          if (serviceAccountStr.trim().startsWith('{')) {
            serviceAccount = JSON.parse(
              serviceAccountStr,
            ) as admin.ServiceAccount;
          } else {
            const resolvedPath = path.resolve(process.cwd(), serviceAccountStr);
            if (!fs.existsSync(resolvedPath)) {
              throw new Error(`Firebase credentials file not found at: ${resolvedPath}`);
            }
            const fileContent = fs.readFileSync(resolvedPath, 'utf8');
            serviceAccount = JSON.parse(fileContent) as admin.ServiceAccount;
          }

          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          this.logger.log('✅ Firebase Admin SDK initialized successfully');
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(
            '❌ Failed to initialize Firebase Admin SDK:',
            message,
          );
        }
      } else {
        this.logger.warn(
          '⚠️  Firebase service account key not provided. Skipping initialization.',
        );
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

- [ ] **Step 2: Run unit tests to verify code is correct**
  Run: `npm --prefix backend run test src/firebase/firebase.service.spec.ts`
  Expected: PASS

- [ ] **Step 3: Commit files**
  Run:
  ```bash
  git add backend/src/firebase/firebase.service.ts backend/src/firebase/firebase.service.spec.ts
  git commit -m "feat: support loading firebase credentials from local JSON file path"
  ```

---

### Task 3: Update Docker Compose Volume Mounting

**Files:**
- Modify: `backend/docker-compose.yml:25-43`

- [ ] **Step 1: Add volume mapping to docker-compose.yml**
  Modify `backend/docker-compose.yml` to mount `serviceAccountKey.json` under the `api` service:
  ```yaml
    api:
      build:
        context: .
        target: production
      container_name: mma-api
      restart: unless-stopped
      ports:
        - "${PORT:-3000}:3000"
      volumes:
        - ./serviceAccountKey.json:/app/serviceAccountKey.json
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
  ```

- [ ] **Step 2: Commit docker-compose.yml**
  Run:
  ```bash
  git add backend/docker-compose-yml
  git commit -m "config: mount local firebase serviceAccountKey to docker container"
  ```
