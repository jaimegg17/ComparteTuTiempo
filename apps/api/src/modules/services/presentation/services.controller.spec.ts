import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ServicesController } from './services.controller';
import type { PrismaService } from '@/common/prisma/prisma.service';
import type { CreateServiceUseCase } from '../application/create-service.use-case';
import type { ListServicesUseCase } from '../application/list-services.use-case';
import type { GetServiceUseCase } from '../application/get-service.use-case';
import type { UpdateServiceUseCase } from '../application/update-service.use-case';
import type { DeleteServiceUseCase } from '../application/delete-service.use-case';

describe('ServicesController - getService averageRating', () => {
  const createServiceUseCase = { execute: jest.fn() };
  const listServicesUseCase = { execute: jest.fn() };
  const getServiceUseCase = { execute: jest.fn() };
  const updateServiceUseCase = { execute: jest.fn() };
  const deleteServiceUseCase = { execute: jest.fn() };

  const prisma = {
    service: {
      findUnique: jest.fn(),
    },
    rating: {
      aggregate: jest.fn(),
    },
  };

  const controller = new ServicesController(
    createServiceUseCase as unknown as CreateServiceUseCase,
    listServicesUseCase as unknown as ListServicesUseCase,
    getServiceUseCase as unknown as GetServiceUseCase,
    updateServiceUseCase as unknown as UpdateServiceUseCase,
    deleteServiceUseCase as unknown as DeleteServiceUseCase,
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve averageRating=0 cuando no hay valoraciones', async () => {
    prisma.service.findUnique.mockResolvedValue({
      id: 1,
      title: 'Servicio',
      description: 'Descripción larga suficiente para tests',
      duration: 2,
      location: 'Madrid',
      category: 'EDUCACION',
      type: 'PRESENCIAL',
      status: 'ACTIVO',
      price: 20,
      imageUrl: null,
      userId: 'auth0|u1',
      createdAt: new Date('2026-03-01T10:00:00.000Z'),
      updatedAt: new Date('2026-03-01T10:00:00.000Z'),
      user: { id: 'auth0|u1', name: 'Jaime', email: 'jaime@example.com', createdAt: new Date() },
      ratings: [],
      _count: { ratings: 0, exchanges: 0 },
    });

    prisma.rating.aggregate.mockResolvedValue({
      _avg: { score: null },
      _count: { id: 0 },
    });

    const result = await controller.getService(1);

    expect(result.service.averageRating).toBe(0);
    expect(result.service.totalRatings).toBe(0);
    expect(result.service.totalExchanges).toBe(0);
  });

  it('redondea averageRating a un decimal y usa conteo real', async () => {
    prisma.service.findUnique.mockResolvedValue({
      id: 2,
      title: 'Servicio 2',
      description: 'Otra descripción para test',
      duration: 1.5,
      location: 'Barcelona',
      category: 'ARTE',
      type: 'HIBRIDO',
      status: 'ACTIVO',
      price: 15,
      imageUrl: null,
      userId: 'auth0|u2',
      createdAt: new Date('2026-03-01T10:00:00.000Z'),
      updatedAt: new Date('2026-03-01T10:00:00.000Z'),
      user: { id: 'auth0|u2', name: 'Ana', email: 'ana@example.com', createdAt: new Date() },
      ratings: [],
      _count: { ratings: 3, exchanges: 8 },
    });

    prisma.rating.aggregate.mockResolvedValue({
      _avg: { score: 4.3333 },
      _count: { id: 3 },
    });

    const result = await controller.getService(2);

    expect(result.service.averageRating).toBe(4.3);
    expect(result.service.totalRatings).toBe(3);
    expect(result.service.totalExchanges).toBe(8);
  });

  it('lanza UnauthorizedException en createService si no hay usuario autenticado', async () => {
    await expect(
      controller.createService(
        {
          title: 'Servicio test',
          description: 'Descripción suficientemente larga para pasar validación',
          duration: 1,
          category: 'EDUCACION',
          type: 'PRESENCIAL',
          price: 10,
        },
        {},
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lanza BadRequestException en nearby/search si faltan coordenadas', async () => {
    await expect(
      controller.listNearbyServices({
        page: 1,
        pageSize: 20,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('usa radiusKm por defecto (10) en nearby/search', async () => {
    listServicesUseCase.execute.mockResolvedValue({
      services: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });

    await controller.listNearbyServices({
      nearLat: 40.4168,
      nearLng: -3.7038,
      page: 1,
      pageSize: 20,
    });

    expect(listServicesUseCase.execute).toHaveBeenCalledWith({
      query: expect.objectContaining({
        nearLat: 40.4168,
        nearLng: -3.7038,
        radiusKm: 10,
      }),
    });
  });

  it('lanza BadRequestException en nearby/search si falta nearLng', async () => {
    await expect(
      controller.listNearbyServices({
        nearLat: 40.4168,
        page: 1,
        pageSize: 20,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('respeta radiusKm y filtros enviados en nearby/search', async () => {
    listServicesUseCase.execute.mockResolvedValue({
      services: [
        { id: 1, title: 'Servicio cercano', distanceKm: 3.2 },
      ],
      total: 1,
      page: 2,
      pageSize: 5,
      totalPages: 1,
    });

    const result = await controller.listNearbyServices({
      nearLat: 40.4168,
      nearLng: -3.7038,
      radiusKm: 25,
      page: 2,
      pageSize: 5,
      category: 'EDUCACION',
      type: 'PRESENCIAL',
      q: 'idiomas',
      minPrice: 10,
      maxPrice: 30,
      location: 'Madrid',
    });

    expect(listServicesUseCase.execute).toHaveBeenCalledWith({
      query: expect.objectContaining({
        nearLat: 40.4168,
        nearLng: -3.7038,
        radiusKm: 25,
        page: 2,
        pageSize: 5,
        category: 'EDUCACION',
        type: 'PRESENCIAL',
        q: 'idiomas',
        minPrice: 10,
        maxPrice: 30,
        location: 'Madrid',
      }),
    });

    expect(result.message).toBe('Servicios cercanos obtenidos exitosamente');
    expect(result.services).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(5);
  });
});
