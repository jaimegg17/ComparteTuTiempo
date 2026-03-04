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
    const response = await apiClient.get<RawEventListResponse>(
      `/events?groupId=${communityId}&page=1&pageSize=20`,
    );
    return Array.isArray(response.events) ? response.events.map(normalizeEvent) : [];
  },
};
