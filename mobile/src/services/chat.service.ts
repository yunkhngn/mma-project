import { db } from './firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { apiFetch } from './api';
import { ChatMessage, Conversation } from '../types';

export const chatService = {
  /**
   * Subscribes to real-time updates for messages in a conversation.
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
   * Subscribes to real-time updates for all active conversations (Admin only).
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
   * Sends a message from the passenger.
   */
  async sendFromPassenger(text: string): Promise<any> {
    return apiFetch('/chat/passenger/send', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  /**
   * Sends a message from the admin to a specific passenger (Admin only).
   */
  async sendFromAdmin(passengerId: string, text: string): Promise<any> {
    return apiFetch('/chat/admin/send', {
      method: 'POST',
      body: JSON.stringify({ passengerId, text }),
    });
  },
};
