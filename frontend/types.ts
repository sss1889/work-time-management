
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum PayType {
  MONTHLY = 'MONTHLY',
  HOURLY = 'HOURLY',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be sent to client in a real app
  role: Role;
  payType: PayType;
  payRate: number; // Monthly salary or hourly rate
  goal: number; // Monthly goal
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  report: string;
}
