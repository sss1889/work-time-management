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
    goal?: number;
    created_at: string;
    updated_at: string;
  };
}

export const authAPI = {
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('Login attempt:', { email, API_BASE_URL, endpoint: API_ENDPOINTS.LOGIN });
    
    const url = `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`;
    console.log('Full URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Login error:', error);
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    console.log('Login success:', data);
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