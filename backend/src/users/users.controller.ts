import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Put,
  Post,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  async findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return user details.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new user account (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  async create(
    @Body()
    body: {
      email: string;
      fullName: string;
      phone?: string;
      role: 'passenger' | 'admin';
      password?: string;
    },
  ): Promise<UserEntity> {
    return this.usersService.createUser(body);
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user account settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      fullName?: string;
      phone?: string;
      role?: 'passenger' | 'admin';
      email?: string;
      password?: string;
    },
  ): Promise<UserEntity> {
    return this.usersService.updateUserAdmin(id, body);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user account (Admin only)' })
  @ApiResponse({ status: 250, description: 'User deleted successfully.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.deleteUser(id);
  }

  @Put('profile')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user profile (with avatar upload)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        phone: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Request() req: ExpressRequest & { user: User },
    @Body() body: { fullName?: string; phone?: string },
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserEntity> {
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

  @Put('fcm-token')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update device FCM Token for notifications' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['fcmToken'],
      properties: {
        fcmToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'FCM Token updated successfully.' })
  async updateFcmToken(
    @Request() req: ExpressRequest & { user: User },
    @Body() body: { fcmToken: string },
  ): Promise<UserEntity> {
    return this.usersService.updateFcmToken(req.user.id, body.fcmToken);
  }
}
