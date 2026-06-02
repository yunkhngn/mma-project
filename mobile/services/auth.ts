import { apiFetch } from './api';
import { User } from '../types';

export const authService = {
  /**
   * Synchronize the user profile after successful Firebase login.
   * Creates a new record in the backend database if the user does not exist yet.
   */
  async syncUser(): Promise<User> {
    return apiFetch<User>('/auth/sync', {
      method: 'POST',
    });
  },
};
