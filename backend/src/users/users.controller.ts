import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Put,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Put('profile')
  @UseGuards(FirebaseAuthGuard)
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
}
