import { Injectable, Inject } from '@nestjs/common';
import type { CommunityRepositoryPort } from '../domain/community-repository.port';
import { CommunityListQuery } from '@comparte-tu-tiempo/contracts';
import { COMMUNITY_REPOSITORY_TOKEN } from '../domain/tokens';

export interface ListCommunitiesRequest {
  query: CommunityListQuery;
}

export interface ListCommunitiesResponse {
  communities: {
    communities: any[];
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

    return { communities: result };
  }
}
