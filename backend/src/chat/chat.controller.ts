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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('admin/conversations')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all active conversations (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return list of conversations.' })
  async listConversations() {
    return this.chatService.listConversations();
  }

  @Get('admin/messages/:passengerId')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all messages of a specific passenger (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Return messages.' })
  async getMessages(@Param('passengerId') passengerId: string) {
    return this.chatService.getMessages(passengerId);
  }

  @Post('admin/send')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Send message from admin to a specific passenger (Admin only)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['passengerId', 'text'],
      properties: {
        passengerId: { type: 'string', example: 'passenger-uid-123' },
        text: { type: 'string', example: 'How can we help you?' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully.' })
  async sendFromAdmin(@Body() body: { passengerId: string; text: string }) {
    return this.chatService.sendMessageFromAdmin(body.passengerId, body.text);
  }

  @Post('passenger/send')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send message from passenger to admin' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['text'],
      properties: {
        text: {
          type: 'string',
          example: 'Hello, I have a question about my booking',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully.' })
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
