import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { UpdateServiceUseCase } from './update-service.use-case';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import { Service } from '../domain/service.entity';

const buildService = (overrides: Partial<ReturnType<Service['toContract']>> = {}) =>
  Service.fromContract({
    id: overrides.id ?? 1,
    title: overrides.title ?? 'Servicio de prueba',
    description: overrides.description ?? 'Descripción suficientemente larga para tests',
    detailedDescription: overrides.detailedDescription ?? null,
    duration: overrides.duration ?? 2,
    location: overrides.location ?? 'Madrid',
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

describe('UpdateServiceUseCase', () => {
  let useCase: UpdateServiceUseCase;
  let serviceRepository: jest.Mocked<ServiceRepositoryPort>;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

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

    cloudinaryService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
      extractPublicId: jest.fn(),
    } as unknown as jest.Mocked<CloudinaryService>;

    useCase = new UpdateServiceUseCase(serviceRepository, cloudinaryService);
  });

  it('elimina la imagen anterior cuando se reemplaza imageUrl', async () => {
    serviceRepository.findById.mockResolvedValue(
      buildService({
        id: 10,
        userId: 'auth0|u1',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/services/old.jpg',
      }),
    );
    serviceRepository.update.mockResolvedValue(buildService({ id: 10 }));
    cloudinaryService.extractPublicId.mockReturnValue('v1/comparte-tu-tiempo/services/old');
    cloudinaryService.deleteImage.mockResolvedValue(undefined);

    await useCase.execute({
      id: 10,
      userId: 'auth0|u1',
      data: { imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/services/new.jpg' },
    });

    expect(cloudinaryService.extractPublicId).toHaveBeenCalledWith(
      'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/services/old.jpg',
    );
    expect(cloudinaryService.deleteImage).toHaveBeenCalledWith('v1/comparte-tu-tiempo/services/old');
  });

  it('no elimina imagen si imageUrl no cambia', async () => {
    const sameUrl = 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/services/same.jpg';
    serviceRepository.findById.mockResolvedValue(buildService({ id: 11, userId: 'auth0|u1', imageUrl: sameUrl }));
    serviceRepository.update.mockResolvedValue(buildService({ id: 11, imageUrl: sameUrl }));

    await useCase.execute({
      id: 11,
      userId: 'auth0|u1',
      data: { imageUrl: sameUrl },
    });

    expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();
  });

  it('lanza ForbiddenException si el usuario no es el dueño', async () => {
    serviceRepository.findById.mockResolvedValue(buildService({ id: 12, userId: 'auth0|owner', imageUrl: null }));

    await expect(
      useCase.execute({
        id: 12,
        userId: 'auth0|other',
        data: { title: 'Nuevo título' },
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza NotFoundException si el servicio no existe', async () => {
    serviceRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 999,
        userId: 'auth0|u1',
        data: { title: 'Nuevo título' },
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
