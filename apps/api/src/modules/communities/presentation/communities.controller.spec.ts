import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import type { CreateCommunityUseCase } from '../application/create-community.use-case';
import type { ListCommunitiesUseCase } from '../application/list-communities.use-case';
import type { PrismaService } from '@/common/prisma/prisma.service';

describe('CommunitiesController', () => {
  const createCommunityUseCase = {
    execute: jest.fn(),
  };

  const listCommunitiesUseCase = {
    execute: jest.fn(),
  };

  const prisma = {
    community: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const controller = new CommunitiesController(
    createCommunityUseCase as unknown as CreateCommunityUseCase,
    listCommunitiesUseCase as unknown as ListCommunitiesUseCase,
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lanza 404 al editar una comunidad inexistente', async () => {
    prisma.community.findUnique.mockResolvedValue(null);

    await expect(
      controller.updateCommunity(404, { name: 'Nuevo nombre' }, { user: { sub: 'auth0|u1' } }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza 403 si el usuario no es el creador', async () => {
    prisma.community.findUnique.mockResolvedValue({
      id: 1,
      creatorId: 'auth0|owner',
    });

    await expect(
      controller.updateCommunity(1, { name: 'Otro nombre' }, { user: { sub: 'auth0|other' } }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('actualiza y devuelve la comunidad completa', async () => {
    const createdAt = new Date('2026-03-01T10:00:00.000Z');
    const updatedAt = new Date('2026-03-04T18:00:00.000Z');

    prisma.community.findUnique.mockResolvedValue({
      id: 1,
      creatorId: 'auth0|owner',
    });

    prisma.community.update.mockResolvedValue({
      id: 1,
      name: 'Comunidad editada',
      description: 'Descripción actualizada',
      isPrivate: true,
      creatorId: 'auth0|owner',
      createdAt,
      updatedAt,
    });

    const result = await controller.updateCommunity(
      1,
      { name: 'Comunidad editada', description: 'Descripción actualizada', isPrivate: true },
      { user: { sub: 'auth0|owner' } },
    );

    expect(prisma.community.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Comunidad editada', description: 'Descripción actualizada', isPrivate: true },
    });
    expect(result.community).toEqual({
      id: 1,
      name: 'Comunidad editada',
      description: 'Descripción actualizada',
      isPrivate: true,
      creatorId: 'auth0|owner',
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  });
});
