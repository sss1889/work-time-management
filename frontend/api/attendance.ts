import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from './config';
import { AttendanceRecord } from '../types';

export interface AttendanceAPIRecord {
  id: number;
  user_id: number;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  report: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAttendanceDTO {
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  report: string;
}

export const attendanceAPI = {
  async getMyAttendances(month?: string): Promise<AttendanceAPIRecord[]> {
    const params = month ? `?month=${month}` : '';
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ATTENDANCE}${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch attendances');
    }

    return response.json();
  },

  async createAttendance(data: CreateAttendanceDTO): Promise<AttendanceAPIRecord> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ATTENDANCE}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create attendance');
    }

    return response.json();
  },

  async updateAttendance(id: number, data: CreateAttendanceDTO): Promise<AttendanceAPIRecord> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ATTENDANCE_BY_ID(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update attendance');
    }

    return response.json();
  },
};