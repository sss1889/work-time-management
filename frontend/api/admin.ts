import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from './config';

export interface DashboardData {
  totalHours: number;
  totalSalary: number;
  activeEmployees: number;
  employeeData: {
    name: string;
    totalHours: number;
    totalSalary: number;
  }[];
}

export interface PayrollData {
  month: string;
  totalPayroll: number;
  employees: {
    id: string;
    name: string;
    hours: number;
    salary: number;
  }[];
}

export interface DailyReport {
  id: number;
  userId: number;
  userName: string;
  date: string;
  report: string;
}

export const adminAPI = {
  async getDashboard(): Promise<DashboardData> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_DASHBOARD}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    return response.json();
  },

  async getPayroll(month: string): Promise<PayrollData> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_PAYROLL}?month=${month}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payroll data');
    }

    return response.json();
  },

  async getDailyReports(): Promise<DailyReport[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch daily reports');
    }

    return response.json();
  },
};