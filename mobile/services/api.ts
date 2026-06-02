import { auth } from './firebase';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

/**
 * Trình bọc Fetch API chung để kết nối với Backend.
 * Tự động chèn Firebase ID Token vào Authorization header nếu người dùng đã đăng nhập.
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

  // Tự động đính kèm Firebase ID Token nếu có người dùng đang đăng nhập
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    } catch (error) {
      console.warn('Không thể lấy Firebase ID Token:', error);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `Lỗi kết nối API: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (_) {
      // Bỏ qua nếu không parse được JSON lỗi từ backend
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
