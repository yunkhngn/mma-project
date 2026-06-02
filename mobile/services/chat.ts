import { db } from './firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { apiFetch } from './api';
import { ChatMessage } from '../types';

export const chatService = {
  /**
   * Subscribe to a real-time listener for conversation messages in Firestore.
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
   * Send a message from the passenger to the system.
   */
  async sendFromPassenger(text: string): Promise<any> {
    return apiFetch('/chat/passenger/send', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },
};
