import { EventsController, normalizeEventListQuery } from './events.controller';
import type { CreateEventUseCase } from '../application/create-event.use-case';
import type { ListEventsUseCase } from '../application/list-events.use-case';

describe('EventsController', () => {
  const createEventUseCase = {
    execute: jest.fn(),
  };

  const listEventsUseCase = {
    execute: jest.fn(),
  };

  const controller = new EventsController(
    createEventUseCase as unknown as CreateEventUseCase,
    listEventsUseCase as unknown as ListEventsUseCase,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normaliza communityId como groupId para listados', () => {
    const query = normalizeEventListQuery({
      communityId: 15,
      page: 2,
      pageSize: 10,
      dateFrom: '2026-03-01T00:00:00.000Z',
      dateTo: '2026-03-10T00:00:00.000Z',
    });

    expect(query.groupId).toBe(15);
    expect(query.page).toBe(2);
    expect(query.pageSize).toBe(10);
    expect(query.dateFrom).toBeInstanceOf(Date);
    expect(query.dateTo).toBeInstanceOf(Date);
  });

  it('usa groupId normalizado en listEvents', async () => {
    const toContract = jest.fn().mockReturnValue({ id: 1, title: 'Evento' });
    listEventsUseCase.execute.mockResolvedValue({
      events: {
        events: [{ toContract }],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    });

    const result = await controller.listEvents({ communityId: 3, page: 1, pageSize: 20 });

    expect(listEventsUseCase.execute).toHaveBeenCalledWith({
      query: expect.objectContaining({ groupId: 3, page: 1, pageSize: 20 }),
    });
    expect(result.events).toEqual([{ id: 1, title: 'Evento' }]);
  });

  it('resuelve /events/community/:id usando el mismo flujo real', async () => {
    const toContract = jest.fn().mockReturnValue({ id: 2, title: 'Evento comunidad' });
    listEventsUseCase.execute.mockResolvedValue({
      events: {
        events: [{ toContract }],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    });

    const result = await controller.listEventsByCommunity(77);

    expect(listEventsUseCase.execute).toHaveBeenCalledWith({
      query: expect.objectContaining({ groupId: 77, page: 1, pageSize: 20 }),
    });
    expect(result.communityId).toBe(77);
    expect(result.events).toEqual([{ id: 2, title: 'Evento comunidad' }]);
  });
});
