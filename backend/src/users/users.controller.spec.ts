/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let cloudinaryService: CloudinaryService;

  const mockUser: User = {
    id: 1,
    firebaseUid: 'uid-123',
    fullName: 'Test User',
    phone: '12345',
    email: 'test@example.com',
    role: 'passenger',
    avatar: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadFile: jest.fn(),
          },
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

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should call CloudinaryService and update profile if avatar is uploaded', async () => {
    const mockFile = {
      buffer: Buffer.from('test-avatar'),
    } as Express.Multer.File;

    const mockUpdatedUser = {
      ...mockUser,
      fullName: 'New Name',
      phone: '99999',
      avatar: 'https://cloudinary.com/new-avatar.jpg',
    };

    const uploadFileMock = cloudinaryService.uploadFile as jest.Mock;
    const updateUserMock = usersService.updateUser as jest.Mock;

    uploadFileMock.mockResolvedValue('https://cloudinary.com/new-avatar.jpg');
    updateUserMock.mockResolvedValue(mockUpdatedUser);

    const result = await controller.updateProfile(
      { user: mockUser } as Request & { user: User },
      { fullName: 'New Name', phone: '99999' },
      mockFile,
    );

    expect(uploadFileMock).toHaveBeenCalledWith(mockFile);
    expect(updateUserMock).toHaveBeenCalledWith(1, {
      fullName: 'New Name',
      phone: '99999',
      avatar: 'https://cloudinary.com/new-avatar.jpg',
    });
    expect(result).toEqual(mockUpdatedUser);
  });
});
