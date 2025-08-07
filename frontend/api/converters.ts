import { User, AttendanceRecord, Role, PayType } from '../types';
import { UserAPIResponse } from './users';
import { AttendanceAPIRecord } from './attendance';

// Convert API user response to frontend User type
export const convertUser = (apiUser: UserAPIResponse): User => ({
  id: apiUser.id.toString(),
  name: apiUser.name,
  email: apiUser.email,
  role: apiUser.role as Role,
  payType: apiUser.pay_type as PayType,
  payRate: apiUser.pay_rate,
  goal: apiUser.goal || 0,
  createdAt: apiUser.created_at,
  updatedAt: apiUser.updated_at,
});

// Convert API attendance response to frontend AttendanceRecord type
export const convertAttendance = (apiRecord: AttendanceAPIRecord): AttendanceRecord => {
  // The API returns datetime strings, but we need to extract just the time
  // Since the backend stores times without timezone info, we'll parse them as local time
  const extractTime = (datetimeStr: string): string => {
    // If it's already in HH:MM format, return as is
    if (/^\d{2}:\d{2}$/.test(datetimeStr)) {
      return datetimeStr;
    }
    
    // Otherwise extract time from datetime string
    // Remove Z suffix if present to treat as local time
    const cleanDatetime = datetimeStr.replace('Z', '');
    const time = cleanDatetime.split('T')[1];
    
    if (time) {
      // Return HH:MM format
      return time.substring(0, 5);
    }
    
    // Fallback to parsing with Date object
    const date = new Date(cleanDatetime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const date = apiRecord.date.split('T')[0]; // Extract YYYY-MM-DD from datetime

  return {
    id: apiRecord.id.toString(),
    userId: apiRecord.user_id.toString(),
    date,
    startTime: extractTime(apiRecord.start_time),
    endTime: extractTime(apiRecord.end_time),
    breakMinutes: apiRecord.break_minutes,
    report: apiRecord.report,
  };
};

// Convert frontend attendance data to API format
export const formatAttendanceForAPI = (
  date: string,
  startTime: string,
  endTime: string,
  breakMinutes: number,
  report: string
) => {
  // Combine date and time into datetime format
  // Don't add Z suffix since backend expects local time
  const startDateTime = `${date}T${startTime}:00`;
  const endDateTime = `${date}T${endTime}:00`;

  return {
    date,
    start_time: startDateTime,
    end_time: endDateTime,
    break_minutes: breakMinutes,
    report,
  };
};