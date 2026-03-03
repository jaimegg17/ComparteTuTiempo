import { apiClient } from './client';
import type { Event, EventListResponse } from '@comparte-tu-tiempo/contracts';

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
    try {
      const response = await apiClient.get<RawEventListResponse>(`/events?communityId=${communityId}`);
      if (Array.isArray(response.events)) {
        return response.events.map(normalizeEvent);
      }
    } catch {
      // Fallback endpoint below
    }

    const fallback = await apiClient.get<{ events?: RawEvent[] }>(`/events/community/${communityId}`);
    return Array.isArray(fallback.events) ? fallback.events.map(normalizeEvent) : [];
  },
};
