import { auth } from './firebase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Generic Fetch API wrapper to connect with the Backend.
 * Automatically injects Firebase ID Token into the Authorization header if the user is logged in.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isMultipart = false
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  
  if (!isMultipart && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Automatically attach Firebase ID Token if a user is logged in
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    } catch (error) {
      console.warn('Failed to get Firebase ID Token:', error);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `API connection error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (_) {
      // Ignore if error JSON from backend cannot be parsed
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
