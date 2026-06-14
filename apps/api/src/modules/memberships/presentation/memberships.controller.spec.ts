import { NotImplementedException, UnauthorizedException } from '@nestjs/common';
import {
  MembershipsController,
  normalizeMembershipListQuery,
} from './memberships.controller';
import type { CreateMembershipUseCase } from '../application/create-membership.use-case';
import type { ListMembershipsUseCase } from '../application/list-memberships.use-case';
import type { UpdateMembershipUseCase } from '../application/update-membership.use-case';

describe('MembershipsController', () => {
  const createMembershipUseCase = {
    execute: jest.fn(),
  };

  const listMembershipsUseCase = {
    execute: jest.fn(),
  };

  const updateMembershipUseCase = {
    execute: jest.fn(),
  };

  const controller = new MembershipsController(
    createMembershipUseCase as unknown as CreateMembershipUseCase,
    listMembershipsUseCase as unknown as ListMembershipsUseCase,
    updateMembershipUseCase as unknown as UpdateMembershipUseCase,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normaliza communityId como groupId en query de membresías', () => {
    const query = normalizeMembershipListQuery({ communityId: 9, page: 2, pageSize: 25 });

    expect(query.groupId).toBe(9);
    expect(query.page).toBe(2);
    expect(query.pageSize).toBe(25);
  });

  it('prioriza groupId explícito sobre communityId', () => {
    const query = normalizeMembershipListQuery({ groupId: 11, communityId: 9 });
    expect(query.groupId).toBe(11);
  });

  it('lista membresías usando query normalizada', async () => {
    const toContract = jest.fn().mockReturnValue({ id: 1, groupId: 4, userId: 'auth0|u1' });
    listMembershipsUseCase.execute.mockResolvedValue({
      memberships: {
        memberships: [{ toContract }],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    });

    const result = await controller.listMemberships({ communityId: 4, page: 1, pageSize: 20 });

    expect(listMembershipsUseCase.execute).toHaveBeenCalledWith({
      query: expect.objectContaining({ groupId: 4, page: 1, pageSize: 20 }),
    });
    expect(result.memberships).toEqual([{ id: 1, groupId: 4, userId: 'auth0|u1' }]);
  });

  it('no devuelve éxito falso al borrar membresía porque no hay delete use case', async () => {
    await expect(controller.deleteMembership(1, { user: { sub: 'auth0|u1' } })).rejects.toThrow(NotImplementedException);
  });

  it('lanza UnauthorizedException al crear membresía sin usuario autenticado', async () => {
    await expect(
      controller.createMembership(
        { groupId: 10, userId: 'auth0|u2', role: 'MEMBER', status: 'ACTIVA' },
        {},
      ),
    ).rejects.toThrow(UnauthorizedException);
  });
});
