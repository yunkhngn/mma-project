import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { FirebaseService } from '../firebase/firebase.service';

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
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
    it('should run transaction and return message', async () => {
      mockFirestore.runTransaction.mockImplementation(
        (cb: (tx: unknown) => Promise<unknown>) => {
          return cb({
            set: jest.fn(),
          });
        },
      );

      const result = await service.sendMessageFromAdmin(
        'user123',
        'Hello back',
      );
      expect(result.senderRole).toBe('admin');
      expect(result.text).toBe('Hello back');
    });
  });

  describe('sendMessageFromPassenger', () => {
    it('should run transaction and return message', async () => {
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
    });
  });
});
