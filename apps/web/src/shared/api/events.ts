import { apiClient } from './client';
import type { Event, EventCreate, EventListResponse, EventUpdate } from '@comparte-tu-tiempo/contracts';

type EventCreateRequest = Omit<EventCreate, 'creatorId'>;

type RawEvent = Omit<Event, 'date' | 'createdAt'> & {
  date: string | Date;
  createdAt: string | Date;
};

type RawEventListResponse = Partial<Omit<EventListResponse, 'events'>> & {
  events?: RawEvent[];
};

const normalizeEvent = (event: RawEvent): Event => ({
  ...event,
  date: new Date(event.date),
  createdAt: new Date(event.createdAt),
});

export const eventsApi = {
  async getEventsByCommunity(communityId: number): Promise<Event[]> {
    const response = await apiClient.get<RawEventListResponse>(
      `/events?communityId=${communityId}&page=1&pageSize=20`,
    );
    return Array.isArray(response.events) ? response.events.map(normalizeEvent) : [];
  },

  async createEvent(data: EventCreateRequest): Promise<{ event: Event }> {
    const response = await apiClient.post<{ event?: RawEvent }>('/events', data);
    if (!response?.event) {
      throw new Error('No se pudo crear el evento');
    }
    return { event: normalizeEvent(response.event) };
  },

  async updateEvent(id: number, data: EventUpdate): Promise<{ event: Event }> {
    const response = await apiClient.put<{ event?: RawEvent }>(`/events/${id}`, data);
    if (!response?.event) {
      throw new Error('No se pudo actualizar el evento');
    }
    return { event: normalizeEvent(response.event) };
  },

  async deleteEvent(id: number): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },
};
