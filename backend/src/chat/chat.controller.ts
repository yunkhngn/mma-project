import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('admin/conversations')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async listConversations() {
    return this.chatService.listConversations();
  }

  @Get('admin/messages/:passengerId')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async getMessages(@Param('passengerId') passengerId: string) {
    return this.chatService.getMessages(passengerId);
  }

  @Post('admin/send')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async sendFromAdmin(@Body() body: { passengerId: string; text: string }) {
    return this.chatService.sendMessageFromAdmin(body.passengerId, body.text);
  }

  @Post('passenger/send')
  @UseGuards(FirebaseAuthGuard)
  async sendFromPassenger(
    @Request() req: ExpressRequest & { user: User },
    @Body() body: { text: string },
  ) {
    return this.chatService.sendMessageFromPassenger(
      req.user.firebaseUid,
      req.user.fullName,
      req.user.email,
      body.text,
    );
  }
}
