import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventsApi } from '@/shared/api/events';
import { apiClient } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('eventsApi.createEvent payload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no envía creatorId y conserva solo los campos que acepta el backend', async () => {
    const date = new Date('2026-04-01T10:00:00.000Z');
    vi.mocked(apiClient.post).mockResolvedValue({
      event: {
        id: 1,
        communityId: 4,
        title: 'Taller de barrio',
        description: 'Actividad comunitaria',
        date: date.toISOString(),
        location: 'Madrid',
        capacity: 20,
        creatorId: 'auth0|server',
        createdAt: date.toISOString(),
      },
    });

    await eventsApi.createEvent({
      communityId: 4,
      title: 'Taller de barrio',
      description: 'Actividad comunitaria',
      date,
      location: 'Madrid',
      capacity: 20,
    });

    expect(apiClient.post).toHaveBeenCalledWith('/events', {
      communityId: 4,
      title: 'Taller de barrio',
      description: 'Actividad comunitaria',
      date,
      location: 'Madrid',
      capacity: 20,
    });
    expect(vi.mocked(apiClient.post).mock.calls[0][1]).not.toHaveProperty('creatorId');
  });
});
