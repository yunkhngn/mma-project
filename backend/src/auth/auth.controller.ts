import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  syncUser(@Request() req: ExpressRequest & { user: User }) {
    return req.user;
  }

  @Post('admin/login')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  adminLogin(@Request() req: ExpressRequest & { user: User }) {
    return req.user;
  }
}
