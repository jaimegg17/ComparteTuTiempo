import { UnauthorizedException } from '@nestjs/common';
import { ExchangesController } from './exchanges.controller';
import { ExchangeEntity } from '../domain/exchange.entity';
import type { CreateExchangeUseCase } from '../application/create-exchange.use-case';
import type { ListExchangesUseCase } from '../application/list-exchanges.use-case';
import type { UpdateExchangeUseCase } from '../application/update-exchange.use-case';
import type { GetExchangeUseCase } from '../application/get-exchange.use-case';
import type { PrismaService } from '@/common/prisma/prisma.service';

describe('ExchangesController', () => {
  const createExchangeUseCase = { execute: jest.fn() };
  const listExchangesUseCase = { execute: jest.fn() };
  const updateExchangeUseCase = { execute: jest.fn() };
  const getExchangeUseCase = { execute: jest.fn() };
  const prisma = {
    service: { findUnique: jest.fn() },
    exchange: { findMany: jest.fn() },
    userNotification: { create: jest.fn() },
  };

  const controller = new ExchangesController(
    createExchangeUseCase as unknown as CreateExchangeUseCase,
    listExchangesUseCase as unknown as ListExchangesUseCase,
    updateExchangeUseCase as unknown as UpdateExchangeUseCase,
    getExchangeUseCase as unknown as GetExchangeUseCase,
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('acepta el payload real del frontend y calcula participantes en servicios ofrecidos', async () => {
    const future = new Date(Date.now() + 60_000);
    const entity = new ExchangeEntity(55, 'auth0|requester', 'auth0|provider', 10, future, 'PENDING', 2, future, future);

    prisma.service.findUnique.mockResolvedValue({
      id: 10,
      userId: 'auth0|provider',
      intent: 'OFFER',
      duration: 2,
      title: 'Clases de pintura',
    });
    createExchangeUseCase.execute.mockResolvedValue({ exchange: entity });
    prisma.userNotification.create.mockResolvedValue({ id: 1 });
    prisma.exchange.findMany.mockResolvedValue([
      {
        id: 55,
        service: { id: 10, title: 'Clases de pintura', duration: 2, category: 'ART', imageUrl: null },
        requestedBy: { id: 'auth0|requester', name: 'Requester', email: 'requester@test.com', imageUrl: null },
        offeredBy: { id: 'auth0|provider', name: 'Provider', email: 'provider@test.com', imageUrl: null },
      },
    ]);

    await controller.createExchange(
      { serviceId: 10, message: 'Me interesa', exchangedTime: 2 },
      { user: { sub: 'auth0|requester' } },
    );

    expect(createExchangeUseCase.execute).toHaveBeenCalledWith({
      data: expect.objectContaining({
        serviceId: 10,
        requestedById: 'auth0|requester',
        offeredById: 'auth0|provider',
        exchangedTime: 2,
      }),
      userId: 'auth0|requester',
    });
    expect(prisma.userNotification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'auth0|provider',
        type: 'EXCHANGE_REQUEST',
        link: '/exchanges/55',
      }),
    });
  });

  it('en servicios tipo REQUEST invierte roles y notifica al dueño de la solicitud', async () => {
    const future = new Date(Date.now() + 60_000);
    const entity = new ExchangeEntity(77, 'auth0|request-owner', 'auth0|helper', 11, future, 'PENDING', 3, future, future);

    prisma.service.findUnique.mockResolvedValue({
      id: 11,
      userId: 'auth0|request-owner',
      intent: 'REQUEST',
      duration: 3,
      title: 'Necesito revisar mi CV',
    });
    createExchangeUseCase.execute.mockResolvedValue({ exchange: entity });
    prisma.userNotification.create.mockResolvedValue({ id: 2 });
    prisma.exchange.findMany.mockResolvedValue([
      {
        id: 77,
        service: { id: 11, title: 'Necesito revisar mi CV', duration: 3, category: 'EDUCACION', imageUrl: null },
        requestedBy: { id: 'auth0|request-owner', name: 'Owner', email: 'owner@test.com', imageUrl: null },
        offeredBy: { id: 'auth0|helper', name: 'Helper', email: 'helper@test.com', imageUrl: null },
      },
    ]);

    await controller.createExchange(
      { serviceId: 11, message: 'Puedo ayudarte', exchangedTime: 3 },
      { user: { sub: 'auth0|helper' } },
    );

    expect(createExchangeUseCase.execute).toHaveBeenCalledWith({
      data: expect.objectContaining({
        serviceId: 11,
        requestedById: 'auth0|request-owner',
        offeredById: 'auth0|helper',
        exchangedTime: 3,
      }),
      userId: 'auth0|helper',
    });
    expect(prisma.userNotification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'auth0|request-owner',
        type: 'EXCHANGE_REQUEST',
        title: 'Nueva respuesta a tu solicitud',
        link: '/exchanges/77',
      }),
    });
  });

  it('acepta actualización de estado desde las acciones del frontend', async () => {
    const now = new Date();
    const entity = new ExchangeEntity(55, 'auth0|requester', 'auth0|provider', 10, now, 'CONFIRMED', 2, now, now);
    updateExchangeUseCase.execute.mockResolvedValue({ exchange: entity });

    await controller.updateExchange(55, { state: 'CONFIRMED' }, { user: { sub: 'auth0|provider' } });

    expect(updateExchangeUseCase.execute).toHaveBeenCalledWith({
      id: 55,
      data: { state: 'CONFIRMED' },
      userId: 'auth0|provider',
    });
  });

  it('rechaza crear intercambio sin usuario autenticado', async () => {
    await expect(controller.createExchange({ serviceId: 10 }, {})).rejects.toThrow(UnauthorizedException);
    expect(createExchangeUseCase.execute).not.toHaveBeenCalled();
  });
});
