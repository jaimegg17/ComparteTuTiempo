import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import type { CreateCommunityUseCase } from '../application/create-community.use-case';
import type { ListCommunitiesUseCase } from '../application/list-communities.use-case';
import type { PrismaService } from '@/common/prisma/prisma.service';

describe('CommunitiesController', () => {
  const createCommunityUseCase = { execute: jest.fn() };
  const listCommunitiesUseCase = { execute: jest.fn() };
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
    community: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    communityMembership: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
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

  it('filtra organizaciones aprobadas por defecto cuando no hay creatorId', async () => {
    prisma.community.findMany.mockResolvedValue([]);
    prisma.community.count.mockResolvedValue(0);

    await controller.listCommunities({ kind: 'ORGANIZATION' });

    expect(prisma.community.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { kind: 'ORGANIZATION', verificationStatus: 'APPROVED' },
      }),
    );
  });

  it('bloquea cambios de rol si el usuario no es owner ni admin global', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'USER' });
    prisma.communityMembership.findUnique.mockResolvedValue(null);

    await expect(
      controller.updateCommunityMember(
        9,
        11,
        { role: 'OWNER' },
        { user: { sub: 'auth0|user' } },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('bloquea aprobar organizaciones si el usuario no es admin', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'USER' });

    await expect(
      controller.approveOrganization(9, { user: { sub: 'auth0|user' } }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('aprueba una organización cuando el usuario es admin', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
    prisma.community.findUnique.mockResolvedValue({
      id: 9,
      name: 'Org demo',
      description: 'desc',
      imageUrl: null,
      topics: [],
      rules: [],
      resources: [],
      kind: 'ORGANIZATION',
      verificationStatus: 'PENDING',
      isPrivate: false,
      creatorId: 'auth0|owner',
      createdAt: new Date('2026-03-25T20:00:00.000Z'),
      updatedAt: new Date('2026-03-25T20:00:00.000Z'),
    });
    prisma.community.update.mockResolvedValue({
      id: 9,
      name: 'Org demo',
      description: 'desc',
      imageUrl: null,
      topics: [],
      rules: [],
      resources: [],
      kind: 'ORGANIZATION',
      verificationStatus: 'APPROVED',
      isPrivate: false,
      creatorId: 'auth0|owner',
      createdAt: new Date('2026-03-25T20:00:00.000Z'),
      updatedAt: new Date('2026-03-25T20:05:00.000Z'),
    });

    const result = await controller.approveOrganization(9, { user: { sub: 'auth0|admin' } });

    expect(prisma.community.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { verificationStatus: 'APPROVED' },
    });
    expect(result.community.verificationStatus).toBe('APPROVED');
  });

  it('permite a un owner actualizar recursos de su comunidad', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'USER' });
    prisma.community.findUnique.mockResolvedValue({
      id: 12,
      name: 'Comunidad creativa',
      description: 'desc',
      imageUrl: null,
      topics: [],
      rules: ['Respeto mutuo'],
      resources: [],
      kind: 'COMMUNITY',
      verificationStatus: 'NONE',
      isPrivate: false,
      creatorId: 'auth0|owner',
      createdAt: new Date('2026-03-25T20:00:00.000Z'),
      updatedAt: new Date('2026-03-25T20:00:00.000Z'),
    });
    prisma.communityMembership.findUnique.mockResolvedValue({
      role: 'OWNER',
      status: 'ACTIVE',
    });
    prisma.community.update.mockResolvedValue({
      id: 12,
      name: 'Comunidad creativa',
      description: 'desc',
      imageUrl: null,
      topics: [],
      rules: ['Respeto mutuo'],
      resources: [
        {
          title: 'Documento base',
          type: 'link',
          url: 'https://example.com',
          description: 'Normas ampliadas',
          imageUrl: null,
        },
      ],
      kind: 'COMMUNITY',
      verificationStatus: 'NONE',
      isPrivate: false,
      creatorId: 'auth0|owner',
      createdAt: new Date('2026-03-25T20:00:00.000Z'),
      updatedAt: new Date('2026-03-25T20:05:00.000Z'),
    });

    const result = await controller.updateCommunity(
      12,
      {
        resources: [
          {
            title: 'Documento base',
            type: 'link',
            url: 'https://example.com',
            description: 'Normas ampliadas',
            imageUrl: null,
          },
        ],
      },
      { user: { sub: 'auth0|owner' } },
    );

    expect(prisma.community.update).toHaveBeenCalled();
    expect(result.community.resources).toHaveLength(1);
    const firstResource = result.community.resources[0] as { title?: string } | undefined;
    expect(firstResource?.title).toBe('Documento base');
  });

  it('crea una solicitud pendiente al unirse a una comunidad privada', async () => {
    prisma.community.findUnique.mockResolvedValue({
      id: 21,
      isPrivate: true,
    });
    prisma.communityMembership.upsert.mockResolvedValue({
      id: 9,
      communityId: 21,
      userId: 'auth0|member',
      role: 'MEMBER',
      status: 'PENDING',
      joinedAt: new Date('2026-03-26T00:10:00.000Z'),
      user: { name: 'Usuario', imageUrl: null },
    });

    const result = await controller.joinCommunity(21, { user: { sub: 'auth0|member' } });

    expect(prisma.communityMembership.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ status: 'PENDING' }),
        create: expect.objectContaining({ status: 'PENDING' }),
      }),
    );
    expect(result.membership.status).toBe('PENDING');
  });

  it('elimina una comunidad real solo si el usuario puede gestionarla', async () => {
    prisma.community.findUnique.mockResolvedValue({ id: 42, creatorId: 'auth0|owner' });
    prisma.user.findUnique.mockResolvedValue({ role: 'USER' });
    prisma.communityMembership.findUnique.mockResolvedValue({ role: 'OWNER', status: 'ACTIVE' });
    prisma.community.delete.mockResolvedValue({ id: 42 });

    await controller.deleteCommunity(42, { user: { sub: 'auth0|owner' } });

    expect(prisma.community.delete).toHaveBeenCalledWith({ where: { id: 42 } });
  });

  it('no devuelve éxito falso al eliminar una comunidad sin permisos', async () => {
    prisma.community.findUnique.mockResolvedValue({ id: 42, creatorId: 'auth0|owner' });
    prisma.user.findUnique.mockResolvedValue({ role: 'USER' });
    prisma.communityMembership.findUnique.mockResolvedValue(null);

    await expect(controller.deleteCommunity(42, { user: { sub: 'auth0|other' } })).rejects.toThrow(ForbiddenException);
    expect(prisma.community.delete).not.toHaveBeenCalled();
  });

  it('permite a un owner aprobar una solicitud pendiente', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'USER' });
    prisma.communityMembership.findUnique
      .mockResolvedValueOnce({ role: 'OWNER', status: 'ACTIVE' })
      .mockResolvedValueOnce({ id: 31, communityId: 12, userId: 'auth0|pending', role: 'MEMBER', status: 'PENDING' });
    prisma.communityMembership.update.mockResolvedValue({
      id: 31,
      communityId: 12,
      userId: 'auth0|pending',
      role: 'MEMBER',
      status: 'ACTIVE',
      joinedAt: new Date('2026-03-26T00:11:00.000Z'),
      user: { name: 'Pendiente', imageUrl: null },
    });

    const result = await controller.updateCommunityMember(
      12,
      31,
      { status: 'ACTIVE' },
      { user: { sub: 'auth0|owner' } },
    );

    expect(prisma.communityMembership.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 31 },
        data: expect.objectContaining({ status: 'ACTIVE' }),
      }),
    );
    expect(result.membership.status).toBe('ACTIVE');
  });
});
