/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should update user fields successfully', async () => {
    const mockUser = {
      id: 1,
      firebaseUid: 'uid-123',
      fullName: 'Updated Name',
      phone: '0123456789',
      email: 'test@example.com',
      role: 'passenger',
      avatar: 'https://cloudinary.com/avatar.jpg',
      createdAt: new Date(),
    };

    const updateMock = prisma.user.update as jest.Mock;
    updateMock.mockResolvedValue(mockUser);

    const result = await service.updateUser(1, {
      fullName: 'Updated Name',
      phone: '0123456789',
      avatar: 'https://cloudinary.com/avatar.jpg',
    });

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        fullName: 'Updated Name',
        phone: '0123456789',
        avatar: 'https://cloudinary.com/avatar.jpg',
      },
    });
    expect(result.fullName).toBe('Updated Name');
    expect(result.avatar).toBe('https://cloudinary.com/avatar.jpg');
  });

  it('should update fcm token successfully', async () => {
    const mockUser = {
      id: 1,
      firebaseUid: 'uid-123',
      fullName: 'Name',
      phone: '0123',
      email: 'test@example.com',
      role: 'passenger',
      avatar: null,
      fcmToken: 'fcm-token-123',
      createdAt: new Date(),
    };

    const updateMock = prisma.user.update as jest.Mock;
    updateMock.mockResolvedValue(mockUser);

    const result = await service.updateFcmToken(1, 'fcm-token-123');

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        fcmToken: 'fcm-token-123',
      },
    });
    expect(result.fcmToken).toBe('fcm-token-123');
  });
});
