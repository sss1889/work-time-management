import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from './config';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    pay_type: string;
    pay_rate: number;
  };
}

export const authAPI = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      // Clear token regardless of API response
      localStorage.removeItem('authToken');
    }
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
};