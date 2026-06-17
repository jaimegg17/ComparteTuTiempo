import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { UpdateUserDto } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    userNotification: {
      findMany: jest.Mock;
      count: jest.Mock;
      updateMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let cloudinaryService: jest.Mocked<CloudinaryService>;
  const authReq = (sub?: string) => (sub ? { user: { sub } } : {});
  const updateDto = (partial: Partial<UpdateUserDto>): UpdateUserDto =>
    partial as unknown as UpdateUserDto;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      userNotification: {
        findMany: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
        findFirst: jest.fn(),
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
        updateDto({ name: 'Owner', email: 'owner@test.com' }),
        authReq('auth0|other'),
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza UnauthorizedException si no hay usuario autenticado', async () => {
    await expect(
      controller.updateUserProfile(
        'auth0|owner',
        updateDto({ name: 'Owner', email: 'owner@test.com' }),
        {},
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lanza NotFound si el usuario no existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      controller.updateUserProfile(
        'auth0|u1',
        updateDto({ name: 'User', email: 'user@test.com' }),
        authReq('auth0|u1'),
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('devuelve histórico de notificaciones ampliado a 100 elementos ordenados por fecha', async () => {
    prisma.userNotification.findMany.mockResolvedValue([]);
    prisma.userNotification.count.mockResolvedValue(0);

    const result = await controller.getMyNotifications(authReq('auth0|u1'));

    expect(prisma.userNotification.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'auth0|u1' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }));
    expect(result).toEqual({
      message: 'Notifications retrieved successfully',
      notifications: [],
      unreadCount: 0,
    });
  });

  it('marca todas las notificaciones solo del usuario autenticado', async () => {
    prisma.userNotification.updateMany.mockResolvedValue({ count: 2 });

    await controller.markAllMyNotificationsAsRead(authReq('auth0|u1'));

    expect(prisma.userNotification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'auth0|u1', isRead: false },
      data: expect.objectContaining({ isRead: true, readAt: expect.any(Date) }),
    });
  });

  it('no permite marcar como leída una notificación de otro usuario', async () => {
    prisma.userNotification.findFirst.mockResolvedValue(null);

    await expect(controller.markMyNotificationAsRead(99, authReq('auth0|u1'))).rejects.toThrow(NotFoundException);

    expect(prisma.userNotification.findFirst).toHaveBeenCalledWith({
      where: { id: 99, userId: 'auth0|u1' },
      select: { id: true },
    });
    expect(prisma.userNotification.update).not.toHaveBeenCalled();
  });

  it('marca como leída una notificación propia', async () => {
    prisma.userNotification.findFirst.mockResolvedValue({ id: 99 });
    prisma.userNotification.update.mockResolvedValue({ id: 99, isRead: true });

    const result = await controller.markMyNotificationAsRead(99, authReq('auth0|u1'));

    expect(prisma.userNotification.update).toHaveBeenCalledWith({
      where: { id: 99 },
      data: expect.objectContaining({ isRead: true, readAt: expect.any(Date) }),
    });
    expect(result.notificationId).toBe(99);
  });

  it('limpia imagen anterior cuando cambia imageUrl', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'auth0|u1',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/profiles/old.jpg',
    } as unknown as Record<string, unknown>);
    prisma.user.update.mockResolvedValue({
      id: 'auth0|u1',
      email: 'user@test.com',
      name: 'User',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/profiles/new.jpg',
    } as unknown as Record<string, unknown>);
    cloudinaryService.extractPublicId.mockReturnValue('v1/comparte-tu-tiempo/profiles/old');
    cloudinaryService.deleteImage.mockResolvedValue(undefined);

    await controller.updateUserProfile(
      'auth0|u1',
      {
        name: 'User',
        email: 'user@test.com',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/profiles/new.jpg',
      } as unknown as UpdateUserDto,
      authReq('auth0|u1'),
    );

    expect(cloudinaryService.deleteImage).toHaveBeenCalledWith('v1/comparte-tu-tiempo/profiles/old');
  });

  it('no limpia imagen si no cambia imageUrl', async () => {
    const sameUrl = 'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/profiles/same.jpg';
    prisma.user.findUnique.mockResolvedValue({
      id: 'auth0|u1',
      imageUrl: sameUrl,
    } as unknown as Record<string, unknown>);
    prisma.user.update.mockResolvedValue({
      id: 'auth0|u1',
      email: 'user@test.com',
      name: 'User',
      imageUrl: sameUrl,
    } as unknown as Record<string, unknown>);

    await controller.updateUserProfile(
      'auth0|u1',
      updateDto({ name: 'User', email: 'user@test.com', imageUrl: sameUrl }),
      authReq('auth0|u1'),
    );

    expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();
  });
});
