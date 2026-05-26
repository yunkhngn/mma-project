import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let firebaseService: FirebaseService;

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
    firebaseService = module.get<FirebaseService>(FirebaseService);
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

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

    const result = await service.validateAndSyncUser('valid-token');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'existing-uid' },
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
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

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockNewDbUser);

    const result = await service.validateAndSyncUser('valid-token');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'new-uid' },
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
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
