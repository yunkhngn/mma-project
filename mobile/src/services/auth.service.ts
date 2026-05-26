import { apiFetch } from './api';
import { User } from '../types';

export const authService = {
  /**
   * Syncs the user's profile after a successful Firebase login.
   * Creates a new user record in the backend database if they do not exist yet.
   */
  async syncUser(): Promise<User> {
    return apiFetch<User>('/auth/sync', {
      method: 'POST',
    });
  },

  /**
   * Authenticates the admin user and verifies administrative permissions.
   */
  async adminLogin(): Promise<User> {
    return apiFetch<User>('/auth/admin/login', {
      method: 'POST',
    });
  },
};
