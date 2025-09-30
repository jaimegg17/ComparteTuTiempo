import { GroupEntity } from './group.entity';
import { GroupCreate, GroupUpdate, GroupListQuery } from '@comparte-tu-tiempo/contracts';

export interface GroupRepositoryPort {
  create(data: GroupCreate): Promise<GroupEntity>;
  findById(id: number): Promise<GroupEntity | null>;
  findByCommunityId(communityId: number): Promise<GroupEntity[]>;
  findByCreatorId(creatorId: string): Promise<GroupEntity[]>;
  update(id: number, data: GroupUpdate): Promise<GroupEntity>;
  delete(id: number): Promise<void>;
  list(query: GroupListQuery): Promise<{
    groups: GroupEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
}
