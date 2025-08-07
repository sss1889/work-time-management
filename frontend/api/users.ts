import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from './config';
import { User, Role, PayType } from '../types';

export interface UserAPIResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  pay_type: string;
  pay_rate: number;
  goal?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: string;
  pay_type: string;
  pay_rate: number;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: string;
  pay_type?: string;
  pay_rate?: number;
  goal?: number;
}

export const usersAPI = {
  async getAllUsers(): Promise<UserAPIResponse[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  async createUser(data: CreateUserDTO): Promise<UserAPIResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    return response.json();
  },

  async updateUser(id: number, data: UpdateUserDTO): Promise<UserAPIResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER_BY_ID(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }

    return response.json();
  },

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER_BY_ID(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
  },
};