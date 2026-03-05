import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import { Service } from '../domain/service.entity';
import { CreateServiceUseCase } from './create-service.use-case';
import { GoogleMapsService } from '@/common/maps/google-maps.service';

const buildService = (overrides: Partial<ReturnType<Service['toContract']>> = {}) =>
  Service.fromContract({
    id: overrides.id ?? 1,
    title: overrides.title ?? 'Servicio de prueba',
    description: overrides.description ?? 'Descripción suficientemente larga para tests',
    detailedDescription: overrides.detailedDescription ?? null,
    duration: overrides.duration ?? 2,
    location: overrides.location ?? 'Madrid',
    latitude: overrides.latitude ?? null,
    longitude: overrides.longitude ?? null,
    formattedAddress: overrides.formattedAddress ?? null,
    placeId: overrides.placeId ?? null,
    availability: overrides.availability ?? null,
    category: overrides.category ?? 'EDUCACION',
    type: overrides.type ?? 'PRESENCIAL',
    status: overrides.status ?? 'ACTIVO',
    price: overrides.price ?? 20,
    imageUrl: overrides.imageUrl ?? null,
    userId: overrides.userId ?? 'auth0|u1',
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  });

describe('CreateServiceUseCase', () => {
  let useCase: CreateServiceUseCase;
  let serviceRepository: jest.Mocked<ServiceRepositoryPort>;
  let googleMapsService: jest.Mocked<GoogleMapsService>;

  beforeEach(() => {
    serviceRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    googleMapsService = {
      geocodeAddress: jest.fn(),
    } as unknown as jest.Mocked<GoogleMapsService>;

    useCase = new CreateServiceUseCase(serviceRepository, googleMapsService);
  });

  it('geocodifica dirección cuando se crea sin coordenadas', async () => {
    serviceRepository.create.mockResolvedValue(buildService({ id: 20 }));
    googleMapsService.geocodeAddress.mockResolvedValue({
      latitude: 40.4168,
      longitude: -3.7038,
      formattedAddress: 'Madrid, España',
      placeId: 'mock-place-id',
    });

    await useCase.execute({
      userId: 'auth0|u1',
      data: {
        title: 'Clases de matemáticas',
        description: 'Ofrezco clases de matemáticas para secundaria y bachillerato',
        duration: 2,
        location: 'Madrid',
        category: 'EDUCACION',
        type: 'PRESENCIAL',
        price: 10,
      },
    });

    expect(googleMapsService.geocodeAddress).toHaveBeenCalledWith('Madrid');
    expect(serviceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        location: 'Madrid',
        latitude: 40.4168,
        longitude: -3.7038,
        formattedAddress: 'Madrid, España',
        placeId: 'mock-place-id',
      }),
      'auth0|u1',
    );
  });
});
