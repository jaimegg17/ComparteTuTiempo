import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { GroupRepositoryPort } from '../domain/group-repository.port';
import { GroupCreate } from '@comparte-tu-tiempo/contracts';
import { GroupEntity } from '../domain/group.entity';
import { GROUP_REPOSITORY_TOKEN } from '../domain/tokens';

export interface CreateGroupRequest {
  data: GroupCreate;
  userId: string; // The user creating the group
}

export interface CreateGroupResponse {
  group: GroupEntity;
}

@Injectable()
export class CreateGroupUseCase {
  constructor(
    @Inject(GROUP_REPOSITORY_TOKEN)
    private readonly groupRepository: GroupRepositoryPort
  ) {}

  async execute(request: CreateGroupRequest): Promise<CreateGroupResponse> {
    const { data, userId } = request;

    // Business logic validation
    if (data.creatorId !== userId) {
      throw new BadRequestException('No puedes crear grupos en nombre de otro usuario');
    }

    if (!data.name || data.name.trim().length < 3) {
      throw new BadRequestException('El nombre del grupo debe tener al menos 3 caracteres');
    }

    if (data.name.length > 100) {
      throw new BadRequestException('El nombre del grupo no puede exceder 100 caracteres');
    }

    if (!data.description || data.description.trim().length < 10) {
      throw new BadRequestException('La descripción debe tener al menos 10 caracteres');
    }

    if (data.description.length > 500) {
      throw new BadRequestException('La descripción no puede exceder 500 caracteres');
    }

    const group = await this.groupRepository.create(data);

    return { group };
  }
}
