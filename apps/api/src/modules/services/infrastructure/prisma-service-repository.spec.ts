import { PrismaServiceRepository } from './prisma-service-repository';
import type { PrismaService } from '@/common/prisma/prisma.service';
import type { ServiceMapper } from './service.mapper';

describe('PrismaServiceRepository - nearby list', () => {
  const prisma = {
    service: {
      findMany: jest.fn(),
    },
  };

  const mapper = {} as ServiceMapper;
  const repository = new PrismaServiceRepository(prisma as unknown as PrismaService, mapper);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseDate = new Date('2026-03-07T10:00:00.000Z');

  const makeService = (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    title: 'Servicio',
    description: 'Descripción',
    detailedDescription: null,
    duration: 1,
    location: 'Madrid',
    latitude: 40.4168,
    longitude: -3.7038,
    formattedAddress: null,
    placeId: null,
    availability: null,
    category: 'EDUCACION',
    type: 'PRESENCIAL',
    status: 'ACTIVO',
    price: 20,
    imageUrl: null,
    userId: 'auth0|u1',
    createdAt: baseDate,
    updatedAt: baseDate,
    user: { id: 'auth0|u1', name: 'User 1', imageUrl: null },
    ratings: [],
    _count: { ratings: 0, exchanges: 0 },
    ...overrides,
  });

  it('filtra por radio y ordena por distancia ascendente', async () => {
    prisma.service.findMany.mockResolvedValue([
      makeService({ id: 1, title: 'Centro Madrid', latitude: 40.4168, longitude: -3.7038 }),
      makeService({ id: 2, title: 'Retiro', latitude: 40.4202, longitude: -3.6889 }),
      makeService({ id: 3, title: 'Barcelona', latitude: 41.3874, longitude: 2.1686 }),
    ]);

    const result = await repository.list({
      page: 1,
      pageSize: 10,
      nearLat: 40.4168,
      nearLng: -3.7038,
      radiusKm: 5,
    });

    expect(prisma.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          latitude: { not: null },
          longitude: { not: null },
        }),
      }),
    );

    expect(result.services.map((s) => s.id)).toEqual([1, 2]);
    expect(result.services[0].distanceKm).toBeLessThanOrEqual(result.services[1].distanceKm as number);
    expect(result.services.every((s) => (s.distanceKm as number) <= 5)).toBe(true);
  });

  it('aplica radiusKm por defecto (10) cuando no se envía', async () => {
    prisma.service.findMany.mockResolvedValue([
      makeService({ id: 10, title: 'Muy cerca', latitude: 40.4168, longitude: -3.7038 }),
      makeService({ id: 11, title: 'Lejos >10km', latitude: 40.7000, longitude: -3.7000 }),
    ]);

    const result = await repository.list({
      page: 1,
      pageSize: 10,
      nearLat: 40.4168,
      nearLng: -3.7038,
    });

    expect(result.services.map((s) => s.id)).toEqual([10]);
    expect(result.total).toBe(1);
  });
});
