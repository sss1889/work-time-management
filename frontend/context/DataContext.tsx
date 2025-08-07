'use client';

import React, { createContext, useState, ReactNode, useCallback, useEffect, useContext } from 'react';
import { User, AttendanceRecord } from '../types';
import { usersAPI } from '../api/users';
import { attendanceAPI } from '../api/attendance';
import { adminAPI } from '../api/admin';
import { convertUser, convertAttendance, formatAttendanceForAPI } from '../api/converters';
import { AuthContext } from './AuthContext';
import { API_BASE_URL, getAuthHeaders, API_ENDPOINTS } from '../api/config';
import { UserAPIResponse } from '../api/users';

interface DataContextType {
  // Data
  users: User[];
  attendanceRecords: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  
  // User methods
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Attendance methods
  fetchAttendanceRecords: (month?: string) => Promise<void>;
  fetchUserAttendanceRecords: (userId: string, month?: string) => Promise<void>;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  updateAttendanceRecord: (record: AttendanceRecord) => Promise<void>;
  
  // Dashboard data
  dashboardData: any;
  fetchDashboardData: () => Promise<void>;
  
  // Payroll data
  fetchPayrollData: (month: string) => Promise<any>;
  
  // Daily reports
  dailyReports: any[];
  fetchDailyReports: () => Promise<void>;
}

export const DataContext = createContext<DataContextType>({
  users: [],
  attendanceRecords: [],
  loading: false,
  error: null,
  fetchUsers: async () => {},
  addUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
  changePassword: async () => {},
  fetchAttendanceRecords: async () => {},
  fetchUserAttendanceRecords: async () => {},
  addAttendanceRecord: async () => {},
  updateAttendanceRecord: async () => {},
  dashboardData: null,
  fetchDashboardData: async () => {},
  fetchPayrollData: async () => null,
  dailyReports: [],
  fetchDailyReports: async () => {},
});

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user, updateCurrentUser } = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dailyReports, setDailyReports] = useState<any[]>([]);

  // Fetch users (admin only)
  const fetchUsers = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const apiUsers = await usersAPI.getAllUsers();
      setUsers(apiUsers.map(convertUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add user (admin only)
  const addUser = useCallback(async (userData: Omit<User, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newUser = await usersAPI.createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password || '',
        role: userData.role,
        pay_type: userData.payType,
        pay_rate: userData.payRate,
      });
      
      setUsers(prev => [...prev, convertUser(newUser)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user 
  const updateUser = useCallback(async (updatedUser: User) => {
    setLoading(true);
    setError(null);
    
    try {
      let updated: UserAPIResponse;
      
      // If user is updating themselves (only goal), use profile endpoint
      if (user && user.id === updatedUser.id) {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROFILE}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            goal: updatedUser.goal,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        updated = await response.json();
      } else {
        // Admin updating other users, use admin endpoint
        updated = await usersAPI.updateUser(parseInt(updatedUser.id), {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          pay_type: updatedUser.payType,
          pay_rate: updatedUser.payRate,
          goal: updatedUser.goal,
        });
      }
      
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? convertUser(updated) : u));
      
      // If updating current user, also update AuthContext
      if (user && user.id === updatedUser.id) {
        const updatedUserData = convertUser(updated);
        updateCurrentUser(updatedUserData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete user (admin only)
  const deleteUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await usersAPI.deleteUser(parseInt(userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/profile/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch attendance records
  const fetchAttendanceRecords = useCallback(async (month?: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const records = await attendanceAPI.getMyAttendances(month);
      setAttendanceRecords(records.map(convertAttendance));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch user attendance records (admin only)
  const fetchUserAttendanceRecords = useCallback(async (userId: string, month?: string) => {
    if (user?.role !== 'ADMIN') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/attendances${month ? `?month=${month}` : ''}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user attendance records');
      }

      const records = await response.json();
      setAttendanceRecords(records.map(convertAttendance));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user attendance records');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add attendance record
  const addAttendanceRecord = useCallback(async (recordData: Omit<AttendanceRecord, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiData = formatAttendanceForAPI(
        recordData.date,
        recordData.startTime,
        recordData.endTime,
        recordData.breakMinutes,
        recordData.report
      );
      
      const newRecord = await attendanceAPI.createAttendance(apiData);
      setAttendanceRecords(prev => [...prev, convertAttendance(newRecord)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add attendance record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update attendance record
  const updateAttendanceRecord = useCallback(async (updatedRecord: AttendanceRecord) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiData = formatAttendanceForAPI(
        updatedRecord.date,
        updatedRecord.startTime,
        updatedRecord.endTime,
        updatedRecord.breakMinutes,
        updatedRecord.report
      );
      
      const updated = await attendanceAPI.updateAttendance(parseInt(updatedRecord.id), apiData);
      setAttendanceRecords(prev => 
        prev.map(r => r.id === updatedRecord.id ? convertAttendance(updated) : r)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update attendance record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard data (admin only)
  const fetchDashboardData = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminAPI.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch payroll data (admin only)
  const fetchPayrollData = useCallback(async (month: string) => {
    if (user?.role !== 'ADMIN') return null;
    
    try {
      return await adminAPI.getPayroll(month);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payroll data');
      throw err;
    }
  }, [user]);

  // Fetch daily reports
  const fetchDailyReports = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const reports = await adminAPI.getDailyReports();
      setDailyReports(reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch daily reports');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-fetch data when user changes
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        fetchUsers();
        fetchDashboardData();
      }
      fetchAttendanceRecords();
    }
  }, [user, fetchUsers, fetchDashboardData, fetchAttendanceRecords]);

  const value = {
    users,
    attendanceRecords,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    changePassword,
    fetchAttendanceRecords,
    fetchUserAttendanceRecords,
    addAttendanceRecord,
    updateAttendanceRecord,
    dashboardData,
    fetchDashboardData,
    fetchPayrollData,
    dailyReports,
    fetchDailyReports,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};