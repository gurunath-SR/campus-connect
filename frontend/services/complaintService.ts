import api from './api';
import type { Complaint, ComplaintStatus } from '../types';

export const complaintService = {
  async getAll(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Complaint[]> {
    const { data } = await api.get<{ complaints: Complaint[] }>('/complaints', {
      params,
    });
    return data.complaints;
  },

  async create(formData: FormData): Promise<Complaint> {
    const { data } = await api.post<{ complaint: Complaint }>(
      '/complaints',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data.complaint;
  },

  async updateStatus(
    id: string,
    status: ComplaintStatus,
    adminRemarks: string
  ): Promise<Complaint> {
    const { data } = await api.put<{ complaint: Complaint }>(
      `/complaints/${id}/status`,
      { status, adminRemarks }
    );
    return data.complaint;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/complaints/${id}`);
  },
};
