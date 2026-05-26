import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();
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
}
