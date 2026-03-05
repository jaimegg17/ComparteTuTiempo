import { UnauthorizedException } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import type { CreateCommunityUseCase } from '../application/create-community.use-case';
import type { ListCommunitiesUseCase } from '../application/list-communities.use-case';
import type { PrismaService } from '@/common/prisma/prisma.service';

describe('CommunitiesController', () => {
  const createCommunityUseCase = { execute: jest.fn() };
  const listCommunitiesUseCase = { execute: jest.fn() };
  const prisma = {
    community: {
      findMany: jest.fn(),
      count: jest.fn(),
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

  it('lanza UnauthorizedException al crear comunidad sin usuario autenticado', async () => {
    await expect(
      controller.createCommunity(
        { name: 'Comunidad', description: 'Descripción', isPrivate: false },
        { user: undefined },
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('aplica defaults de paginación y filtros en listCommunities', async () => {
    prisma.community.findMany.mockResolvedValue([]);
    prisma.community.count.mockResolvedValue(0);

    await controller.listCommunities({ isPrivate: true });

    expect(prisma.community.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPrivate: true },
        skip: 0,
        take: 20,
      }),
    );
  });
});

