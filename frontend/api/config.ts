// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088/api';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  
  // Users (Admin only)
  USERS: '/users',
  USER_BY_ID: (id: number) => `/users/${id}`,
  
  // Profile (User can update their own)
  PROFILE: '/profile',
  
  // Attendance
  ATTENDANCE: '/attendance',
  ATTENDANCE_BY_ID: (id: number) => `/attendance/${id}`,
  
  // Reports
  REPORTS: '/reports',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PAYROLL: '/admin/payroll',
};

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};