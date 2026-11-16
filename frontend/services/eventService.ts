import api from './api';
import type { CampusEvent, EventRegistrationItem } from '../types';

export const eventService = {
  async getAll(params?: {
    category?: string;
    search?: string;
  }): Promise<CampusEvent[]> {
    const { data } = await api.get<{ events: CampusEvent[] }>('/events', {
      params,
    });
    return data.events;
  },

  async create(formData: FormData): Promise<CampusEvent> {
    const { data } = await api.post<{ event: CampusEvent }>('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.event;
  },

  async update(id: string, formData: FormData): Promise<CampusEvent> {
    const { data } = await api.put<{ event: CampusEvent }>(
      `/events/${id}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data.event;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  async register(id: string): Promise<{ registeredCount: number }> {
    const { data } = await api.post<{ registeredCount: number }>(
      `/events/${id}/register`
    );
    return data;
  },

  async cancelRegistration(id: string): Promise<{ registeredCount: number }> {
    const { data } = await api.delete<{ registeredCount: number }>(
      `/events/${id}/register`
    );
    return data;
  },

  async getRegistrations(id: string): Promise<{
    event: CampusEvent;
    registrations: EventRegistrationItem[];
  }> {
    const { data } = await api.get<{
      event: CampusEvent;
      registrations: EventRegistrationItem[];
    }>(`/events/${id}/registrations`);
    return data;
  },
};
