import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { CommunityRepositoryPort } from '../domain/community-repository.port';
import { CommunityCreate } from '@comparte-tu-tiempo/contracts';
import { CommunityEntity } from '../domain/community.entity';
import { COMMUNITY_REPOSITORY_TOKEN } from '../domain/tokens';

export interface CreateCommunityRequest {
  data: CommunityCreate;
  userId: string; // The user creating the community
}

export interface CreateCommunityResponse {
  community: CommunityEntity;
}

@Injectable()
export class CreateCommunityUseCase {
  constructor(
    @Inject(COMMUNITY_REPOSITORY_TOKEN)
    private readonly communityRepository: CommunityRepositoryPort
  ) {}

  async execute(request: CreateCommunityRequest): Promise<CreateCommunityResponse> {
    const { data, userId } = request;

    // Business logic validation
    if (data.creatorId !== userId) {
      throw new BadRequestException('No puedes crear comunidades en nombre de otro usuario');
    }

    if (!data.name || data.name.trim().length < 3) {
      throw new BadRequestException('El nombre de la comunidad debe tener al menos 3 caracteres');
    }

    if (data.name.length > 100) {
      throw new BadRequestException('El nombre de la comunidad no puede exceder 100 caracteres');
    }

    if (!data.description || data.description.trim().length < 10) {
      throw new BadRequestException('La descripción debe tener al menos 10 caracteres');
    }

    if (data.description.length > 500) {
      throw new BadRequestException('La descripción no puede exceder 500 caracteres');
    }

    const community = await this.communityRepository.create(data);

    return { community };
  }
}
