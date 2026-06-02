import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

export const apiClient = {
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API GET request failed: ${response.statusText}`);
    }
    return response.json();
  },

  async post<T>(path: string, body: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API POST request failed: ${response.statusText}`);
    }
    return response.json();
  },
};
