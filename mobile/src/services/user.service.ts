import { apiFetch } from './api';
import { User } from '../types';

export const userService = {
  /**
   * Retrieves a list of all users (Admin only).
   */
  async getAllUsers(): Promise<User[]> {
    return apiFetch<User[]>('/users');
  },

  /**
   * Retrieves detailed user information by ID (Admin only).
   */
  async getUserById(id: number): Promise<User> {
    return apiFetch<User>(`/users/${id}`);
  },

  /**
   * Updates the current user's profile information (supports avatar upload).
   */
  async updateProfile(
    fullName?: string,
    phone?: string,
    avatarUri?: string
  ): Promise<User> {
    const formData = new FormData();
    if (fullName) formData.append('fullName', fullName);
    if (phone) formData.append('phone', phone);
    
    if (avatarUri) {
      const filename = avatarUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      // Format file object to be compatible with React Native FormData
      formData.append('avatar', {
        uri: avatarUri,
        name: filename,
        type,
      } as any);
    }

    return apiFetch<User>('/users/profile', {
      method: 'PUT',
      body: formData,
    }, true); // Mark isMultipart = true to automatically omit Content-Type header
  },

  /**
   * Updates the FCM token for push notifications.
   */
  async updateFcmToken(fcmToken: string): Promise<User> {
    return apiFetch<User>('/users/fcm-token', {
      method: 'PUT',
      body: JSON.stringify({ fcmToken }),
    });
  },
};
