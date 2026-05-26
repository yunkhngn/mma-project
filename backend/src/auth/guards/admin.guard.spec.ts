import { AdminGuard } from './admin.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { User } from '@prisma/client';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  it('should allow activation if user has admin role', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'admin' } as User,
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw ForbiddenException if user is not admin', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'passenger' } as User,
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is undefined', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: undefined,
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });
});
