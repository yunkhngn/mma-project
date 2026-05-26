# UC02 - Profile Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement profile updates for users, supporting basic details updating (`fullName`, `phone`) and custom `avatar` uploading to Cloudinary.

**Architecture:** Update Prisma schema with optional `avatar` field and run migration. Install `cloudinary` and `@types/multer` dependencies. Create `CloudinaryModule` to handle image upload. Update `UsersController` with `PUT /users/profile` protected by `FirebaseAuthGuard` and `FileInterceptor` for image upload.

**Tech Stack:** NestJS, Prisma ORM, Cloudinary SDK, Jest, Multer.

---

## Plan Details

### Task 1: Install Dependencies and Update Config

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/.env.example`
- Modify: `backend/src/config/config.service.ts`

- [ ] **Step 1: Install packages**
  Run:
  ```bash
  npm --prefix backend install cloudinary
  npm --prefix backend install -D @types/multer
  ```

- [ ] **Step 2: Add Cloudinary variables to `.env.example`**
  Append to `backend/.env.example`:
  ```env
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```

- [ ] **Step 3: Update `AppConfigService` to expose Cloudinary environment variables**
  Modify `backend/src/config/config.service.ts`:
  - Add getters for `cloudinaryCloudName`, `cloudinaryApiKey`, and `cloudinaryApiSecret`.

- [ ] **Step 4: Commit Config and Package changes**
  Run:
  ```bash
  git add backend/package.json backend/package-lock.json backend/.env.example backend/src/config/config.service.ts
  git commit -m "config: install cloudinary dependencies and update configuration service"
  ```

---

### Task 2: Update Database Schema and Run Migration

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Update Prisma schema**
  Modify `backend/prisma/schema.prisma` to add the optional `avatar String?` field to `User` model:
  ```prisma
  model User {
    id          Int       @id @default(autoincrement())
    firebaseUid String    @unique @map("firebase_uid")
    fullName    String    @map("full_name")
    phone       String
    email       String    @unique
    role        String
    avatar      String?   // Added
    createdAt   DateTime  @default(now()) @map("created_at")
    bookings    Booking[]

    @@map("users")
  }
  ```

- [ ] **Step 2: Run database migration locally**
  Run:
  ```bash
  npm --prefix backend run prisma:migrate -- --name add_avatar_to_user
  ```
  Verify the migration runs successfully and generates the updated Prisma Client.

- [ ] **Step 3: Commit Prisma migration files**
  Run:
  ```bash
  git add backend/prisma/
  git commit -m "migration: add avatar field to user table"
  ```

---

### Task 3: Implement Cloudinary Module

**Files:**
- Create: `backend/src/cloudinary/cloudinary.service.ts`
- Create: `backend/src/cloudinary/cloudinary.module.ts`
- Create: `backend/src/cloudinary/cloudinary.service.spec.ts`

- [ ] **Step 1: Create unit test file `cloudinary.service.spec.ts`**
  Create `backend/src/cloudinary/cloudinary.service.spec.ts` to mock Cloudinary SDK and verify the file upload stream logic:
  ```typescript
  import { Test, TestingModule } from '@nestjs/testing';
  import { CloudinaryService } from './cloudinary.service';
  import { AppConfigService } from '../config/config.service';
  import { v2 as cloudinary } from 'cloudinary';

  jest.mock('cloudinary', () => ({
    v2: {
      config: jest.fn(),
      uploader: {
        upload_stream: jest.fn(),
      },
    },
  }));

  describe('CloudinaryService', () => {
    let service: CloudinaryService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CloudinaryService,
          {
            provide: AppConfigService,
            useValue: {
              cloudinaryCloudName: 'test-cloud',
              cloudinaryApiKey: 'test-key',
              cloudinaryApiSecret: 'test-secret',
            },
          },
        ],
      }).compile();

      service = module.get<CloudinaryService>(CloudinaryService);
    });

    it('should successfully upload a file stream and return URL', async () => {
      const mockResult = { secure_url: 'https://cloudinary.com/avatar.jpg' };
      const mockUploadStream = jest.fn((options, callback) => {
        callback(null, mockResult);
        return { end: jest.fn() };
      });
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(mockUploadStream);

      const mockFile = {
        buffer: Buffer.from('test-image-content'),
      } as Express.Multer.File;

      const result = await service.uploadFile(mockFile);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { folder: 'mma_avatars' },
        expect.any(Function),
      );
      expect(result).toBe('https://cloudinary.com/avatar.jpg');
    });
  });
  ```

- [ ] **Step 2: Implement `CloudinaryService`**
  Create `backend/src/cloudinary/cloudinary.service.ts`:
  - Implement `uploadFile(file: Express.Multer.File): Promise<string>` using `cloudinary.uploader.upload_stream`.

- [ ] **Step 3: Implement `CloudinaryModule`**
  Create `backend/src/cloudinary/cloudinary.module.ts`:
  - Import `AppConfigModule` and export `CloudinaryService`.

- [ ] **Step 4: Run unit tests to verify Cloudinary service**
  Run: `npm --prefix backend run test src/cloudinary/`
  Expected: PASS

- [ ] **Step 5: Commit Cloudinary files**
  Run:
  ```bash
  git add backend/src/cloudinary/
  git commit -m "feat(cloudinary): implement cloudinary upload service and module"
  ```

---

### Task 4: Implement Profile Update in Users Module

**Files:**
- Modify: `backend/src/users/users.service.ts`
- Modify: `backend/src/users/users.controller.ts`
- Modify: `backend/src/users/users.module.ts`
- Create/Modify: Tests in `backend/src/users/`

- [ ] **Step 1: Implement `updateUser` in `UsersService`**
  Modify `backend/src/users/users.service.ts` to support database update for specific fields.

- [ ] **Step 2: Update `UsersController` with `PUT /users/profile`**
  Modify `backend/src/users/users.controller.ts`:
  - Protect with `UseGuards(FirebaseAuthGuard)`.
  - Intercept using `FileInterceptor('avatar')`.
  - Process update by uploading to Cloudinary (if file provided) and saving to MySQL.

- [ ] **Step 3: Register `CloudinaryModule` and `AuthModule` in `UsersModule`**
  Modify `backend/src/users/users.module.ts` to import `CloudinaryModule` and `AuthModule` (needed for `FirebaseAuthGuard`).

- [ ] **Step 4: Add Unit Tests for profile updates**
  Write unit tests to verify `UsersService.updateUser` and `UsersController.updateProfile` work as expected.
  Verify by running: `npm --prefix backend run test src/users/`

- [ ] **Step 5: Verify all backend tests pass**
  Run: `npm --prefix backend run test`
  Expected: All tests pass.

- [ ] **Step 6: Commit Users module updates**
  Run:
  ```bash
  git add backend/src/users/
  git commit -m "feat(users): implement profile update and avatar upload (UC02)"
  ```
