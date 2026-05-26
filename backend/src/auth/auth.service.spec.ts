/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockVerifyIdToken = jest.fn();
  const mockAuth = jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  }));
  const mockFirebaseAdmin = {
    auth: mockAuth,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: {
            getAdmin: () => mockFirebaseAdmin,
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException if email is missing in decoded token', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'test-uid',
      name: 'Test User',
    });

    await expect(service.validateAndSyncUser('valid-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return existing user if user is found in database', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'existing-uid',
      email: 'test@example.com',
      name: 'Existing User',
    });

    const mockDbUser = {
      id: 1,
      firebaseUid: 'existing-uid',
      email: 'test@example.com',
      fullName: 'Existing User',
      phone: '',
      role: 'passenger',
    };

    const findUniqueMock = prisma.user.findUnique as jest.Mock;
    const createMock = prisma.user.create as jest.Mock;

    findUniqueMock.mockResolvedValue(mockDbUser);

    const result = await service.validateAndSyncUser('valid-token');

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { firebaseUid: 'existing-uid' },
    });
    expect(createMock).not.toHaveBeenCalled();
    expect(result).toEqual(mockDbUser);
  });

  it('should create and return new user if user is not found in database', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'new-uid',
      email: 'new@example.com',
      name: 'New User',
    });

    const mockNewDbUser = {
      id: 2,
      firebaseUid: 'new-uid',
      email: 'new@example.com',
      fullName: 'New User',
      phone: '',
      role: 'passenger',
    };

    const findUniqueMock = prisma.user.findUnique as jest.Mock;
    const createMock = prisma.user.create as jest.Mock;

    findUniqueMock.mockResolvedValue(null);
    createMock.mockResolvedValue(mockNewDbUser);

    const result = await service.validateAndSyncUser('valid-token');

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { firebaseUid: 'new-uid' },
    });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        firebaseUid: 'new-uid',
        email: 'new@example.com',
        fullName: 'New User',
        phone: '',
        role: 'passenger',
      },
    });
    expect(result).toEqual(mockNewDbUser);
  });
});
