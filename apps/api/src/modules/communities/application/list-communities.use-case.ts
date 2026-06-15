import { Injectable, Inject } from '@nestjs/common';
import type { CommunityRepositoryPort } from '../domain/community-repository.port';
import { CommunityListQuery } from '@comparte-tu-tiempo/contracts';
import { COMMUNITY_REPOSITORY_TOKEN } from '../domain/tokens';
import type { CommunityEntity } from '../domain/community.entity';

export interface ListCommunitiesRequest {
  query: CommunityListQuery;
}

export interface ListCommunitiesResponse {
  communities: {
    communities: CommunityEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable()
export class ListCommunitiesUseCase {
  constructor(
    @Inject(COMMUNITY_REPOSITORY_TOKEN)
    private readonly communityRepository: CommunityRepositoryPort
  ) {}

  async execute(request: ListCommunitiesRequest): Promise<ListCommunitiesResponse> {
    const { query } = request;
    const result = await this.communityRepository.list(query);

    if (!result || !Array.isArray(result.communities)) {
      throw new Error('Invalid result structure from repository');
    }

    return { communities: result };
  }
}
