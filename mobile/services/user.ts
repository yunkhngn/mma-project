import { apiFetch } from './api';
import { User } from '../types';

export const userService = {
  /**
   * Cập nhật thông tin cá nhân của người dùng hiện tại (hỗ trợ upload ảnh đại diện).
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
      
      // Định dạng File object tương thích với React Native FormData
      formData.append('avatar', {
        uri: avatarUri,
        name: filename,
        type,
      } as any);
    }

    return apiFetch<User>('/users/profile', {
      method: 'PUT',
      body: formData,
    }, true); // Đánh dấu isMultipart = true để tự động bỏ Content-Type
  },

  /**
   * Cập nhật FCM token phục vụ cho việc gửi thông báo đẩy.
   */
  async updateFcmToken(fcmToken: string): Promise<User> {
    return apiFetch<User>('/users/fcm-token', {
      method: 'PUT',
      body: JSON.stringify({ fcmToken }),
    });
  },
};
