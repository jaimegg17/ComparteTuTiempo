import { Injectable, Inject } from '@nestjs/common';
import type { GroupRepositoryPort } from '../domain/group-repository.port';
import { GroupListQuery } from '@comparte-tu-tiempo/contracts';
import { GROUP_REPOSITORY_TOKEN } from '../domain/tokens';

export interface ListGroupsRequest {
  query: GroupListQuery;
}

export interface ListGroupsResponse {
  groups: {
    groups: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable()
export class ListGroupsUseCase {
  constructor(
    @Inject(GROUP_REPOSITORY_TOKEN)
    private readonly groupRepository: GroupRepositoryPort
  ) {}

  async execute(request: ListGroupsRequest): Promise<ListGroupsResponse> {
    const { query } = request;

    const result = await this.groupRepository.list(query);

    return { groups: result };
  }
}
