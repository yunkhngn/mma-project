import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Sync user profile from Firebase (creates if not exists)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return synchronized user details.',
  })
  syncUser(@Request() req: ExpressRequest & { user: User }) {
    return req.user;
  }

  @Post('admin/login')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin login validation' })
  @ApiResponse({ status: 200, description: 'Return admin user details.' })
  adminLogin(@Request() req: ExpressRequest & { user: User }) {
    return req.user;
  }
}
