import api from './api';
import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementPriority,
} from '../types';

export interface AnnouncementPayload {
  title: string;
  description: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
}

export const announcementService = {
  async getAll(params?: {
    category?: string;
    search?: string;
  }): Promise<Announcement[]> {
    const { data } = await api.get<{ announcements: Announcement[] }>(
      '/announcements',
      { params }
    );
    return data.announcements;
  },

  async create(payload: AnnouncementPayload): Promise<Announcement> {
    const { data } = await api.post<{ announcement: Announcement }>(
      '/announcements',
      payload
    );
    return data.announcement;
  },

  async update(
    id: string,
    payload: Partial<AnnouncementPayload>
  ): Promise<Announcement> {
    const { data } = await api.put<{ announcement: Announcement }>(
      `/announcements/${id}`,
      payload
    );
    return data.announcement;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/announcements/${id}`);
  },
};
