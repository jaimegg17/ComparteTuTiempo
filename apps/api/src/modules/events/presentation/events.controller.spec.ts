import { EventsController, normalizeEventListQuery } from './events.controller';
import type { CreateEventUseCase } from '../application/create-event.use-case';
import type { ListEventsUseCase } from '../application/list-events.use-case';
import type { PrismaService } from '@/common/prisma/prisma.service';

describe('EventsController', () => {
  const createEventUseCase = {
    execute: jest.fn(),
  };

  const listEventsUseCase = {
    execute: jest.fn(),
  };

  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
    communityMembership: {
      findUnique: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    eventRegistration: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
    userNotification: {
      create: jest.fn(),
    },
  };

  const controller = new EventsController(
    createEventUseCase as unknown as CreateEventUseCase,
    listEventsUseCase as unknown as ListEventsUseCase,
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normaliza communityId para listados', () => {
    const query = normalizeEventListQuery({
      communityId: 15,
      page: 2,
      pageSize: 10,
      dateFrom: '2026-03-01T00:00:00.000Z',
      dateTo: '2026-03-10T00:00:00.000Z',
    });

    expect(query.communityId).toBe(15);
    expect(query.page).toBe(2);
    expect(query.pageSize).toBe(10);
    expect(query.dateFrom).toBeInstanceOf(Date);
    expect(query.dateTo).toBeInstanceOf(Date);
  });

  it('usa communityId normalizado en listEvents', async () => {
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
      query: expect.objectContaining({ communityId: 3, page: 1, pageSize: 20 }),
    });
    expect(result.events).toEqual([{ id: 1, title: 'Evento' }]);
  });

  it('resuelve eventos próximos y pasados usando filtros de fecha reales', async () => {
    listEventsUseCase.execute.mockResolvedValue({
      events: { events: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
    });

    await controller.listUpcomingEvents();
    await controller.listPastEvents();

    expect(listEventsUseCase.execute).toHaveBeenNthCalledWith(1, {
      query: expect.objectContaining({ dateFrom: expect.any(Date), page: 1, pageSize: 20 }),
    });
    expect(listEventsUseCase.execute).toHaveBeenNthCalledWith(2, {
      query: expect.objectContaining({ dateTo: expect.any(Date), page: 1, pageSize: 20 }),
    });
  });

  it('obtiene evento por id desde datos reales y no devuelve un placeholder', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 33,
      communityId: 4,
      title: 'Evento real',
      description: 'Descripción real',
      date: new Date('2026-06-20T10:00:00.000Z'),
      location: 'Madrid',
      capacity: 10,
      createdById: 'auth0|owner',
      createdAt: new Date('2026-06-01T10:00:00.000Z'),
      updatedAt: new Date('2026-06-01T10:00:00.000Z'),
    });

    const result = await controller.getEvent(33);

    expect(prisma.event.findUnique).toHaveBeenCalledWith({ where: { id: 33 } });
    expect(result.event).toEqual(expect.objectContaining({ id: 33, title: 'Evento real', communityId: 4 }));
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
      query: expect.objectContaining({ communityId: 77, page: 1, pageSize: 20 }),
    });
    expect(result.communityId).toBe(77);
    expect(result.events).toEqual([{ id: 2, title: 'Evento comunidad' }]);
  });

  it('bloquea la creación de eventos si el usuario no es owner ni admin', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'USER' });
    prisma.communityMembership.findUnique.mockResolvedValue(null);

    await expect(
      controller.createEvent(
        {
          communityId: 4,
          title: 'Evento demo',
          description: 'Descripción suficientemente larga',
          date: new Date('2026-04-01T10:00:00.000Z'),
          location: 'Madrid',
        },
        { user: { sub: 'auth0|user' } },
      ),
    ).rejects.toThrow('No autorizado para crear eventos en esta comunidad');
  });

  it('bloquea la actualización de eventos si el usuario no es owner ni admin', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 8,
      communityId: 4,
    });
    prisma.user.findUnique.mockResolvedValue({ role: 'USER' });
    prisma.communityMembership.findUnique.mockResolvedValue(null);

    await expect(
      controller.updateEvent(
        8,
        { title: 'Nuevo título' },
        { user: { sub: 'auth0|user' } },
      ),
    ).rejects.toThrow('No autorizado para actualizar este evento');
  });

  it('bloquea la inscripción a eventos si el usuario no es miembro activo', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 15,
      communityId: 4,
      capacity: 20,
      _count: { registrations: 0 },
    });
    prisma.communityMembership.findUnique.mockResolvedValue(null);

    await expect(
      controller.registerForEvent(15, { user: { sub: 'auth0|outsider' } }),
    ).rejects.toThrow('Debes pertenecer a la comunidad para apuntarte a sus eventos');

    expect(prisma.eventRegistration.upsert).not.toHaveBeenCalled();
  });

  it('permite inscripción si el usuario es miembro activo y usa upsert para evitar duplicados', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 16,
      title: 'Taller vecinal',
      communityId: 4,
      capacity: 20,
      _count: { registrations: 3 },
    });
    prisma.communityMembership.findUnique.mockResolvedValue({ status: 'ACTIVE' });
    prisma.eventRegistration.upsert.mockResolvedValue({ eventId: 16, userId: 'auth0|member' });
    prisma.userNotification.create.mockResolvedValue({ id: 1 });
    prisma.eventRegistration.count.mockResolvedValue(4);

    const result = await controller.registerForEvent(16, { user: { sub: 'auth0|member' } });

    expect(prisma.eventRegistration.upsert).toHaveBeenCalledWith({
      where: { eventId_userId: { eventId: 16, userId: 'auth0|member' } },
      update: {},
      create: { eventId: 16, userId: 'auth0|member' },
    });
    expect(result.registrationsCount).toBe(4);
  });

  it('bloquea inscripción si el evento está lleno', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 17,
      title: 'Evento lleno',
      communityId: 4,
      capacity: 3,
      _count: { registrations: 3 },
    });
    prisma.communityMembership.findUnique.mockResolvedValue({ status: 'ACTIVE' });

    await expect(
      controller.registerForEvent(17, { user: { sub: 'auth0|member' } }),
    ).rejects.toThrow('El evento ha alcanzado su aforo máximo');

    expect(prisma.eventRegistration.upsert).not.toHaveBeenCalled();
  });

  it('al cancelar inscripción borra solo el registro del usuario autenticado', async () => {
    prisma.event.findUnique.mockResolvedValue({ title: 'Taller vecinal', communityId: 4 });
    prisma.userNotification.create.mockResolvedValue({ id: 2 });
    prisma.eventRegistration.count.mockResolvedValue(2);

    const result = await controller.unregisterFromEvent(16, { user: { sub: 'auth0|member' } });

    expect(prisma.eventRegistration.deleteMany).toHaveBeenCalledWith({
      where: { eventId: 16, userId: 'auth0|member' },
    });
    expect(result.registrationsCount).toBe(2);
  });

  it('permite eliminar un evento si el usuario es admin', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 11,
      communityId: 5,
    });
    prisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
    prisma.event.delete.mockResolvedValue({ id: 11 });

    const result = await controller.deleteEvent(11, { user: { sub: 'auth0|admin' } });

    expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 11 } });
    expect(result.event).toEqual({ id: 11 });
  });
});
