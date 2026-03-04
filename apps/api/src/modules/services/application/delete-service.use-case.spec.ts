import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { DeleteServiceUseCase } from './delete-service.use-case';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';

describe('DeleteServiceUseCase', () => {
  let useCase: DeleteServiceUseCase;
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

    useCase = new DeleteServiceUseCase(serviceRepository, cloudinaryService);
  });

  it('elimina imagen en cloudinary al borrar el servicio', async () => {
    serviceRepository.findById.mockResolvedValue({
      id: 21,
      userId: 'auth0|u1',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/services/to-delete.jpg',
    } as any);
    serviceRepository.delete.mockResolvedValue(undefined);
    cloudinaryService.extractPublicId.mockReturnValue('v1/comparte-tu-tiempo/services/to-delete');
    cloudinaryService.deleteImage.mockResolvedValue(undefined);

    await useCase.execute({ id: 21, userId: 'auth0|u1' });

    expect(serviceRepository.delete).toHaveBeenCalledWith(21, 'auth0|u1');
    expect(cloudinaryService.deleteImage).toHaveBeenCalledWith('v1/comparte-tu-tiempo/services/to-delete');
  });

  it('no falla el borrado del servicio si falla la limpieza en cloudinary', async () => {
    serviceRepository.findById.mockResolvedValue({
      id: 22,
      userId: 'auth0|u1',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/services/to-delete.jpg',
    } as any);
    serviceRepository.delete.mockResolvedValue(undefined);
    cloudinaryService.extractPublicId.mockReturnValue('v1/comparte-tu-tiempo/services/to-delete');
    cloudinaryService.deleteImage.mockRejectedValue(new Error('Cloudinary down'));

    await expect(useCase.execute({ id: 22, userId: 'auth0|u1' })).resolves.toBeUndefined();
  });

  it('lanza ForbiddenException si el usuario no es el dueño', async () => {
    serviceRepository.findById.mockResolvedValue({
      id: 23,
      userId: 'auth0|owner',
      imageUrl: null,
    } as any);

    await expect(useCase.execute({ id: 23, userId: 'auth0|other' })).rejects.toThrow(ForbiddenException);
  });

  it('lanza NotFoundException si no existe', async () => {
    serviceRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 999, userId: 'auth0|u1' })).rejects.toThrow(NotFoundException);
  });
});
