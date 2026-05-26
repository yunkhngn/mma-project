import { db } from './firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { apiFetch } from './api';
import { ChatMessage, Conversation } from '../types';

export const chatService = {
  /**
   * Đăng ký lắng nghe thời gian thực (Real-time listener) tin nhắn của cuộc hội thoại.
   */
  subscribeToMessages(
    passengerId: string,
    callback: (messages: ChatMessage[]) => void
  ) {
    const messagesRef = collection(db, 'conversations', passengerId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      callback(messages);
    });
  },

  /**
   * Đăng ký lắng nghe thời gian thực danh sách các cuộc hội thoại (Chỉ dành cho Admin).
   */
  subscribeToConversations(callback: (conversations: Conversation[]) => void) {
    const convRef = collection(db, 'conversations');
    const q = query(convRef, orderBy('lastMessageAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const conversations: Conversation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        conversations.push({
          passengerId: doc.id,
          passengerName: data.passengerName || '',
          passengerEmail: data.passengerEmail || '',
          lastMessage: data.lastMessage || '',
          lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
          unreadByAdmin: !!data.unreadByAdmin,
        });
      });
      callback(conversations);
    });
  },

  /**
   * Gửi tin nhắn từ hành khách lên hệ thống.
   */
  async sendFromPassenger(text: string): Promise<any> {
    return apiFetch('/chat/passenger/send', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  /**
   * Gửi tin nhắn từ Admin tới hành khách (Chỉ dành cho Admin).
   */
  async sendFromAdmin(passengerId: string, text: string): Promise<any> {
    return apiFetch('/chat/admin/send', {
      method: 'POST',
      body: JSON.stringify({ passengerId, text }),
    });
  },
};
