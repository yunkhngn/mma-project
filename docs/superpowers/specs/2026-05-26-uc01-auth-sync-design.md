# Design Specification: UC01 - Register / Login (Auth Sync)

This design document specifies the architecture and implementation details for user registration and authentication syncing via Firebase Auth in the NestJS backend.

## 1. Problem Statement
We need to allow passengers to register and log in via Firebase Auth (Google / Gmail).
The backend database (MySQL via Prisma) requires user accounts to be stored in the `users` table so we can associate bookings, tickets, and payments with a standard integer `userId`.
We need a secure mechanism to:
1. Verify Firebase ID tokens sent from the mobile client.
2. Automatically provision user records in our MySQL database on their first login.
3. Expose an endpoint for the mobile app to sync its auth state and retrieve the MySQL user object.
4. Protect subsequent backend endpoints using a reusable Guard that decodes the Firebase token and injects the database user into the request context.

## 2. Proposed Changes

### 2.1 File Structure
We will introduce a new NestJS module `AuthModule` located in `src/auth`:
- `src/auth/auth.module.ts`: Wires up `PrismaModule` and `FirebaseModule`.
- `src/auth/auth.service.ts`: Handles Firebase token validation and MySQL database user syncing.
- `src/auth/auth.controller.ts`: Exposes the POST `/auth/sync` endpoint.
- `src/auth/guards/firebase-auth.guard.ts`: Intercepts protected requests, verifies authorization headers, and injects the database user into the request.

### 2.2 Database Sync Details
When a Firebase ID Token is successfully verified:
- We extract the `uid` (Firebase UID), `email`, and `name` from the token.
- We check if a User exists in MySQL with `firebaseUid = uid`.
- If not: We insert a new User with:
  - `firebaseUid`: `uid`
  - `email`: `email`
  - `fullName`: `name` or fallback to email prefix if not present in Firebase profile.
  - `phone`: `""` (empty string, to be updated by the user later).
  - `role`: `"passenger"` (default client role).
- If yes: We return the existing database user record.

## 3. Implementation Details

### 3.1 `auth.service.ts`
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async validateAndSyncUser(token: string) {
    try {
      const decodedToken = await this.firebaseService.getAdmin().auth().verifyIdToken(token);
      const { uid, email, name } = decodedToken;

      if (!email) {
        throw new UnauthorizedException('Email is required from Firebase Auth');
      }

      let user = await this.prisma.user.findUnique({
        where: { firebaseUid: uid },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            firebaseUid: uid,
            email: email,
            fullName: name || email.split('@')[0],
            phone: '',
            role: 'passenger',
          },
        });
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : 'Invalid Firebase token',
      );
    }
  }
}
```

### 3.2 `firebase-auth.guard.ts`
```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const user = await this.authService.validateAndSyncUser(token);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Unauthorized');
    }
  }
}
```

### 3.3 `auth.controller.ts`
```typescript
import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Controller('auth')
export class AuthController {
  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  async syncUser(@Request() req) {
    return req.user;
  }
}
```

### 3.4 `auth.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard],
  exports: [AuthService, FirebaseAuthGuard],
})
export class AuthModule {}
```

## 4. Verification Plan
1. **Invalid Token**: Send POST request to `/auth/sync` with missing or invalid Bearer token. Verify it returns `401 Unauthorized`.
2. **First-time Login Sync**: Mock Firebase Admin SDK to return a decoded token for a non-existing user `firebase-uid-abc`. Call `/auth/sync` with mock token. Verify user is successfully inserted in MySQL database and returned with `id`, `role: 'passenger'`, and `phone: ''`.
3. **Subsequent Login Sync**: Call `/auth/sync` with mock token for an already existing user. Verify it retrieves and returns the existing user profile without duplication.
