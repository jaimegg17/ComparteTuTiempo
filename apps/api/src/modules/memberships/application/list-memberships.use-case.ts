import { Injectable, Inject } from '@nestjs/common';
import { MEMBERSHIP_REPOSITORY_TOKEN } from '../domain/tokens';
import { MembershipRepositoryPort } from '../domain/membership-repository.port';
import { MembershipListQuery } from '@comparte-tu-tiempo/contracts';

export interface ListMembershipsRequest {
  query: MembershipListQuery;
}

export interface ListMembershipsResponse {
  memberships: {
    memberships: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable()
export class ListMembershipsUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY_TOKEN)
    private readonly membershipRepository: MembershipRepositoryPort,
  ) {}

  async execute(request: ListMembershipsRequest): Promise<ListMembershipsResponse> {
    const { query } = request;
    const memberships = await this.membershipRepository.list(query);
    return { memberships };
  }
}


