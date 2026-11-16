import api from './api';
import type { LostFoundItem, LostFoundStatus } from '../types';

export const lostFoundService = {
  async getAll(params?: {
    type?: string;
    status?: string;
    search?: string;
  }): Promise<LostFoundItem[]> {
    const { data } = await api.get<{ items: LostFoundItem[] }>('/lost-found', {
      params,
    });
    return data.items;
  },

  async create(formData: FormData): Promise<LostFoundItem> {
    const { data } = await api.post<{ item: LostFoundItem }>(
      '/lost-found',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data.item;
  },

  async updateStatus(
    id: string,
    status: LostFoundStatus
  ): Promise<LostFoundItem> {
    const { data } = await api.put<{ item: LostFoundItem }>(
      `/lost-found/${id}`,
      { status }
    );
    return data.item;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/lost-found/${id}`);
  },
};
