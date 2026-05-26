# Design Specification: UC02 - Profile Management

This design document specifies the architecture and implementation details for updating user profile information (Full Name, Phone Number, and Avatar) in the NestJS backend, integrating with Cloudinary for image storage.

## 1. Problem Statement
We need to allow users (passengers) to update their profiles:
1. Update basic information: `fullName` and `phone`.
2. Upload a custom `avatar` image file.
3. The image file must be uploaded to Cloudinary, and the secure URL must be saved in the database `users` table under an optional `avatar` field.
4. The profile update endpoint (`PUT /users/profile`) must be secure, accessible only to authenticated users (via `FirebaseAuthGuard`), updating only the profile of the user making the request.

## 2. Proposed Changes

### 2.1 Database Schema (`schema.prisma`)
Modify the `User` model to support an optional avatar URL:
```prisma
model User {
  // ... other fields
  avatar String?
}
```
Run `npx prisma migrate dev --name add_avatar_to_user` to update the MySQL schema and regenerate the Prisma Client.

### 2.2 Cloudinary Configuration & Environment Setup
Install dependencies:
- `cloudinary` (regular dependency)
- `@types/multer` (dev dependency for multer typings)

Add credentials to `backend/.env.example` and `backend/.env`:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Expose these variables via `AppConfigService`.

### 2.3 Cloudinary Module
Create `backend/src/cloudinary/` directory containing:
- `cloudinary.service.ts`: Integrates with Cloudinary SDK to handle file buffer uploading via `upload_stream`.
- `cloudinary.module.ts`: Wires up `CloudinaryService` and imports `AppConfigModule`.

### 2.4 Users Module
Update `UsersService` to support user profile updates:
- `updateUser(userId: number, data: { fullName?: string; phone?: string; avatar?: string })`

Update `UsersController`:
- Inject `CloudinaryService`.
- Add PUT `/users/profile` protected by `FirebaseAuthGuard`.
- Use `FileInterceptor('avatar')` to handle file uploads.
- Call `CloudinaryService` to upload the file if present.
- Save the fields to the database.

## 3. Implementation Details

### 3.1 `cloudinary.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class CloudinaryService {
  constructor(private configService: AppConfigService) {
    cloudinary.config({
      cloud_name: this.configService.cloudinaryCloudName,
      api_key: this.configService.cloudinaryApiKey,
      api_secret: this.configService.cloudinaryApiSecret,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'mma_avatars' },
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result.secure_url);
          reject(new Error('Upload failed with empty result'));
        },
      );
      upload.end(file.buffer);
    });
  }
}
```

### 3.2 `users.controller.ts`
```typescript
import { Controller, Put, UseGuards, Request, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { UsersService } from './users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Put('profile')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Request() req: ExpressRequest & { user: User },
    @Body() body: { fullName?: string; phone?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    let avatarUrl: string | undefined;

    if (file) {
      avatarUrl = await this.cloudinaryService.uploadFile(file);
    }

    return this.usersService.updateUser(userId, {
      fullName: body.fullName,
      phone: body.phone,
      avatar: avatarUrl,
    });
  }
}
```

## 4. Verification Plan
1. **Lint Rules**: Run `npm run lint` and verify no code quality violations exist.
2. **Schema Migration**: Confirm `prisma migrate` applies successfully on database container startup.
3. **Unit Tests**:
   - Write tests for `UsersService.updateUser` to ensure updates are written correctly to the database.
   - Mock `CloudinaryService` inside `UsersController` unit tests. Verify that when a file is provided, `uploadFile` is called, and the user's avatar URL is updated.
4. **API Integration Test**: Verify that calling PUT `/api/users/profile` without credentials returns `401 Unauthorized`.
