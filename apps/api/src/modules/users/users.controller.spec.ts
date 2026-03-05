import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

describe('UsersController', () => {
  let controller: UsersController;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    cloudinaryService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
      extractPublicId: jest.fn(),
    } as unknown as jest.Mocked<CloudinaryService>;

    controller = new UsersController(prisma as unknown as PrismaService, cloudinaryService);
  });

  it('rechaza si intenta actualizar otro usuario', async () => {
    await expect(
      controller.updateUserProfile(
        'auth0|owner',
        { name: 'Owner', email: 'owner@test.com' } as any,
        { user: { sub: 'auth0|other' } } as any,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza UnauthorizedException si no hay usuario autenticado', async () => {
    await expect(
      controller.updateUserProfile(
        'auth0|owner',
        { name: 'Owner', email: 'owner@test.com' } as any,
        {},
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lanza NotFound si el usuario no existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      controller.updateUserProfile(
        'auth0|u1',
        { name: 'User', email: 'user@test.com' } as any,
        { user: { sub: 'auth0|u1' } } as any,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('limpia imagen anterior cuando cambia imageUrl', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'auth0|u1',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/profiles/old.jpg',
    } as any);
    prisma.user.update.mockResolvedValue({
      id: 'auth0|u1',
      email: 'user@test.com',
      name: 'User',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/profiles/new.jpg',
    } as any);
    cloudinaryService.extractPublicId.mockReturnValue('v1/comparte-tu-tiempo/profiles/old');
    cloudinaryService.deleteImage.mockResolvedValue(undefined);

    await controller.updateUserProfile(
      'auth0|u1',
      {
        name: 'User',
        email: 'user@test.com',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/profiles/new.jpg',
      } as any,
      { user: { sub: 'auth0|u1' } } as any,
    );

    expect(cloudinaryService.deleteImage).toHaveBeenCalledWith('v1/comparte-tu-tiempo/profiles/old');
  });

  it('no limpia imagen si no cambia imageUrl', async () => {
    const sameUrl = 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/profiles/same.jpg';
    prisma.user.findUnique.mockResolvedValue({
      id: 'auth0|u1',
      imageUrl: sameUrl,
    } as any);
    prisma.user.update.mockResolvedValue({
      id: 'auth0|u1',
      email: 'user@test.com',
      name: 'User',
      imageUrl: sameUrl,
    } as any);

    await controller.updateUserProfile(
      'auth0|u1',
      { name: 'User', email: 'user@test.com', imageUrl: sameUrl } as any,
      { user: { sub: 'auth0|u1' } } as any,
    );

    expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();
  });
});
