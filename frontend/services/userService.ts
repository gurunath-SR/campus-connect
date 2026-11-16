import api from './api';
import type { User } from '../types';

export interface UpdateProfilePayload {
  name: string;
  department: string;
  semester?: number;
  usn?: string;
  phone?: string;
}

export const userService = {
  async getProfile(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/users/profile');
    return data.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.put<{ user: User }>('/users/profile', payload);
    return data.user;
  },

  async getAllStudents(params?: {
    search?: string;
    department?: string;
  }): Promise<User[]> {
    const { data } = await api.get<{ students: User[] }>('/users/students', {
      params,
    });
    return data.students;
  },

  async deleteStudent(id: string): Promise<void> {
    await api.delete(`/users/students/${id}`);
  },
};
