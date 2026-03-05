import { UnauthorizedException } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import type { CreateGroupUseCase } from '../application/create-group.use-case';
import type { ListGroupsUseCase } from '../application/list-groups.use-case';

describe('GroupsController', () => {
  const createGroupUseCase = { execute: jest.fn() };
  const listGroupsUseCase = { execute: jest.fn() };

  const controller = new GroupsController(
    createGroupUseCase as unknown as CreateGroupUseCase,
    listGroupsUseCase as unknown as ListGroupsUseCase,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lanza UnauthorizedException al crear grupo sin usuario autenticado', async () => {
    await expect(
      controller.createGroup(
        { name: 'Grupo', description: 'Descripción de prueba', type: 'PUBLICO', isPrivate: false },
        { user: undefined },
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('aplica defaults de paginación en listGroups', async () => {
    listGroupsUseCase.execute.mockResolvedValue({
      groups: { groups: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
    });

    await controller.listGroups({});

    expect(listGroupsUseCase.execute).toHaveBeenCalledWith({
      query: {
        page: 1,
        pageSize: 20,
        communityId: undefined,
        creatorId: undefined,
      },
    });
  });
});
