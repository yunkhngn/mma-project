import { apiFetch } from './api';
import { User } from '../types';

export const authService = {
  /**
   * Đồng bộ profile của người dùng sau khi đăng nhập Firebase thành công.
   * Tạo bản ghi mới trong database của backend nếu người dùng chưa tồn tại.
   */
  async syncUser(): Promise<User> {
    return apiFetch<User>('/auth/sync', {
      method: 'POST',
    });
  },

  /**
   * Đăng nhập trang quản trị Admin và xác minh phân quyền admin.
   */
  async adminLogin(): Promise<User> {
    return apiFetch<User>('/auth/admin/login', {
      method: 'POST',
    });
  },
};
