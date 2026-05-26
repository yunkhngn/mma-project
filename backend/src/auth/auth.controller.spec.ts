import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser: User = {
    id: 1,
    firebaseUid: 'uid-123',
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '',
    role: 'passenger',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context
            .switchToHttp()
            .getRequest<Request & { user?: User }>();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should return request.user from syncUser endpoint', () => {
    const result = controller.syncUser({ user: mockUser } as Request & {
      user: User;
    });
    expect(result).toEqual(mockUser);
  });

  describe('adminLogin', () => {
    it('should return request.user if user is admin', () => {
      const adminUser: User = { ...mockUser, role: 'admin' };
      const result = controller.adminLogin({
        user: adminUser,
      } as unknown as Request & { user: User });
      expect(result).toEqual(adminUser);
    });
  });
});
