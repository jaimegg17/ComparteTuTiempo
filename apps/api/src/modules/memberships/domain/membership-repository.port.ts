import { MembershipEntity } from './membership.entity';
import { MembershipCreate, MembershipUpdate, MembershipListQuery } from '@comparte-tu-tiempo/contracts';

export interface MembershipRepositoryPort {
  create(data: MembershipCreate): Promise<MembershipEntity>;
  findById(id: number): Promise<MembershipEntity | null>;
  findByUserId(userId: string): Promise<MembershipEntity[]>;
  findByGroupId(groupId: number): Promise<MembershipEntity[]>;
  findByUserAndGroup(userId: string, groupId: number): Promise<MembershipEntity | null>;
  update(id: number, data: MembershipUpdate): Promise<MembershipEntity>;
  delete(id: number): Promise<void>;
  list(query: MembershipListQuery): Promise<{
    memberships: MembershipEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
}


