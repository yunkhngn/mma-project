import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatService', () => {
  let service: ChatService;

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    runTransaction: jest.fn(),
  };

  const mockFirebaseAdmin = {
    firestore: () => mockFirestore,
  };

  const mockFirebaseService = {
    getAdmin: () => mockFirebaseAdmin,
    sendPushNotification: jest.fn(),
    sendToTopic: jest.fn(),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should compile successfully', () => {
    expect(service).toBeDefined();
  });

  describe('listConversations', () => {
    it('should return mapped conversations', async () => {
      const mockDoc = {
        id: 'user123',
        data: () => ({
          passengerId: 'user123',
          passengerName: 'John Doe',
          passengerEmail: 'john@example.com',
          lastMessage: 'Hello',
          lastMessageAt: {
            toDate: () => new Date('2026-05-26T10:00:00.000Z'),
          },
          unreadByAdmin: true,
          unreadByPassenger: false,
        }),
      };

      mockFirestore.get.mockResolvedValue({
        docs: [mockDoc],
      });

      const result = await service.listConversations();
      expect(result.length).toBe(1);
      expect(result[0].passengerName).toBe('John Doe');
      expect(result[0].unreadByAdmin).toBe(true);
    });
  });

  describe('getMessages', () => {
    it('should return messages and mark as read', async () => {
      const mockMsgDoc = {
        id: 'msg1',
        data: () => ({
          senderId: 'user123',
          senderRole: 'passenger',
          text: 'Hello',
          createdAt: {
            toDate: () => new Date('2026-05-26T10:00:00.000Z'),
          },
        }),
      };

      mockFirestore.get.mockResolvedValue({
        docs: [mockMsgDoc],
      });

      const result = await service.getMessages('user123');
      expect(result.length).toBe(1);
      expect(result[0].text).toBe('Hello');
      expect(mockFirestore.set).toHaveBeenCalledWith(
        { unreadByAdmin: false },
        { merge: true },
      );
    });
  });

  describe('sendMessageFromAdmin', () => {
    it('should run transaction, query passenger, and send notification', async () => {
      mockFirestore.runTransaction.mockImplementation(
        (cb: (tx: unknown) => Promise<unknown>) => {
          return cb({
            set: jest.fn(),
          });
        },
      );

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        fcmToken: 'passenger-token',
      });

      const result = await service.sendMessageFromAdmin(
        'user123',
        'Hello back',
      );
      expect(result.senderRole).toBe('admin');
      expect(result.text).toBe('Hello back');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: 'user123' },
      });
      expect(mockFirebaseService.sendPushNotification).toHaveBeenCalledWith(
        'passenger-token',
        'Tin nhắn mới từ Admin',
        'Hello back',
        { action: 'chat' },
      );
    });
  });

  describe('sendMessageFromPassenger', () => {
    it('should run transaction and send notification to topic', async () => {
      mockFirestore.runTransaction.mockImplementation(
        (cb: (tx: unknown) => Promise<unknown>) => {
          return cb({
            set: jest.fn(),
          });
        },
      );

      const result = await service.sendMessageFromPassenger(
        'user123',
        'John Doe',
        'john@example.com',
        'Help',
      );
      expect(result.senderRole).toBe('passenger');
      expect(result.text).toBe('Help');

      expect(mockFirebaseService.sendToTopic).toHaveBeenCalledWith(
        'admins',
        'Tin nhắn mới từ John Doe',
        'Help',
        { passengerId: 'user123', action: 'chat' },
      );
    });
  });
});
