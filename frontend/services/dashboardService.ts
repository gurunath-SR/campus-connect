import api from './api';
import type { AdminDashboardData, StudentDashboardData } from '../types';

export const dashboardService = {
  async getStudentDashboard(): Promise<StudentDashboardData> {
    const { data } = await api.get<StudentDashboardData>('/dashboard/student');
    return data;
  },

  async getAdminDashboard(): Promise<AdminDashboardData> {
    const { data } = await api.get<AdminDashboardData>('/dashboard/admin');
    return data;
  },
};
