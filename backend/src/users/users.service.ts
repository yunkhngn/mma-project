import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => new UserEntity(user));
  }

  async findOne(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? new UserEntity(user) : null;
  }

  async updateUser(
    id: number,
    data: { fullName?: string; phone?: string; avatar?: string },
  ): Promise<UserEntity> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        avatar: data.avatar,
      },
    });
    return new UserEntity(updatedUser);
  }

  async updateFcmToken(id: number, fcmToken: string): Promise<UserEntity> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { fcmToken },
    });
    return new UserEntity(updatedUser);
  }

  // ==========================================
  // ADMIN USER CRUD ACTIONS
  // ==========================================

  async createUser(data: {
    email: string;
    fullName: string;
    phone?: string;
    role: 'passenger' | 'admin';
    password?: string;
  }): Promise<UserEntity> {
    // 1. Check if user already exists in DB
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new BadRequestException(`User with email ${data.email} already exists`);
    }

    let firebaseUid = '';

    // 2. Create in Firebase
    try {
      const fbUser = await this.firebaseService
        .getAdmin()
        .auth()
        .createUser({
          email: data.email,
          password: data.password || 'user123',
          displayName: data.fullName,
          phoneNumber: data.phone ? (data.phone.startsWith('+') ? data.phone : undefined) : undefined,
        });
      firebaseUid = fbUser.uid;
    } catch (error: any) {
      throw new BadRequestException(`Firebase creation failed: ${error.message}`);
    }

    // 3. Create in local database
    const user = await this.prisma.user.create({
      data: {
        firebaseUid,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone || '',
        role: data.role,
      },
    });

    return new UserEntity(user);
  }

  async updateUserAdmin(
    id: number,
    data: {
      fullName?: string;
      phone?: string;
      role?: 'passenger' | 'admin';
      email?: string;
      password?: string;
    },
  ): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Update in Firebase if needed
    if (user.firebaseUid) {
      try {
        const updateParams: any = {};
        if (data.email && data.email !== user.email) {
          updateParams.email = data.email;
        }
        if (data.fullName) {
          updateParams.displayName = data.fullName;
        }
        if (data.password) {
          updateParams.password = data.password;
        }
        if (Object.keys(updateParams).length > 0) {
          await this.firebaseService
            .getAdmin()
            .auth()
            .updateUser(user.firebaseUid, updateParams);
        }
      } catch (error: any) {
        // Log error but we can proceed if Firebase user does not exist
        console.warn(`Firebase update failed for ${user.firebaseUid}: ${error.message}`);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
        email: data.email,
      },
    });

    return new UserEntity(updated);
  }

  async deleteUser(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 1. Delete from Firebase
    if (user.firebaseUid) {
      try {
        await this.firebaseService
          .getAdmin()
          .auth()
          .deleteUser(user.firebaseUid);
      } catch (error: any) {
        console.warn(`Firebase delete failed for ${user.firebaseUid}: ${error.message}`);
      }
    }

    // 2. Delete from local DB
    const deleted = await this.prisma.user.delete({
      where: { id },
    });

    return new UserEntity(deleted);
  }
}
