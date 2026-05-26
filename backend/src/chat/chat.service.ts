import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'passenger' | 'admin';
  text: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerEmail: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadByAdmin: boolean;
  unreadByPassenger: boolean;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  private getFirestore() {
    try {
      const adminSdk = this.firebaseService.getAdmin();
      return adminSdk.firestore();
    } catch {
      throw new InternalServerErrorException(
        'Firebase Firestore is not initialized/available.',
      );
    }
  }

  async listConversations(): Promise<Conversation[]> {
    const db = this.getFirestore();
    const snapshot = await db
      .collection('conversations')
      .orderBy('lastMessageAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        passengerId: data.passengerId as string,
        passengerName: data.passengerName as string,
        passengerEmail: data.passengerEmail as string,
        lastMessage: data.lastMessage as string,
        lastMessageAt: data.lastMessageAt
          ? (data.lastMessageAt as { toDate: () => Date }).toDate()
          : new Date(),
        unreadByAdmin: !!data.unreadByAdmin,
        unreadByPassenger: !!data.unreadByPassenger,
      };
    });
  }

  async getMessages(passengerId: string): Promise<ChatMessage[]> {
    const db = this.getFirestore();
    const snapshot = await db
      .collection('conversations')
      .doc(passengerId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    // Mark as read by admin when retrieved by admin
    await db.collection('conversations').doc(passengerId).set(
      {
        unreadByAdmin: false,
      },
      { merge: true },
    );

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId as string,
        senderRole: data.senderRole as 'passenger' | 'admin',
        text: data.text as string,
        createdAt: data.createdAt
          ? (data.createdAt as { toDate: () => Date }).toDate()
          : new Date(),
      };
    });
  }

  async sendMessageFromAdmin(
    passengerId: string,
    text: string,
  ): Promise<ChatMessage> {
    const db = this.getFirestore();
    const messageRef = db
      .collection('conversations')
      .doc(passengerId)
      .collection('messages')
      .doc();

    const message = {
      senderId: 'admin',
      senderRole: 'admin' as const,
      text,
      createdAt: new Date(),
    };

    await db.runTransaction((transaction) => {
      transaction.set(messageRef, message);
      transaction.set(
        db.collection('conversations').doc(passengerId),
        {
          lastMessage: text,
          lastMessageAt: message.createdAt,
          unreadByPassenger: true,
          unreadByAdmin: false,
        },
        { merge: true },
      );
      return Promise.resolve();
    });

    // Send push notification to passenger if token is available
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid: passengerId },
    });
    if (user && user.fcmToken) {
      await this.firebaseService.sendPushNotification(
        user.fcmToken,
        'Tin nhắn mới từ Admin',
        text,
        { action: 'chat' },
      );
    }

    return { id: messageRef.id, ...message };
  }

  async sendMessageFromPassenger(
    passengerId: string,
    passengerName: string,
    passengerEmail: string,
    text: string,
  ): Promise<ChatMessage> {
    const db = this.getFirestore();
    const messageRef = db
      .collection('conversations')
      .doc(passengerId)
      .collection('messages')
      .doc();

    const message = {
      senderId: passengerId,
      senderRole: 'passenger' as const,
      text,
      createdAt: new Date(),
    };

    await db.runTransaction((transaction) => {
      transaction.set(messageRef, message);
      transaction.set(
        db.collection('conversations').doc(passengerId),
        {
          passengerId,
          passengerName,
          passengerEmail,
          lastMessage: text,
          lastMessageAt: message.createdAt,
          unreadByPassenger: false,
          unreadByAdmin: true,
        },
        { merge: true },
      );
      return Promise.resolve();
    });

    // Send push notification to all admins via topic
    await this.firebaseService.sendToTopic(
      'admins',
      `Tin nhắn mới từ ${passengerName}`,
      text,
      { passengerId, action: 'chat' },
    );

    return { id: messageRef.id, ...message };
  }
}
