import { CommunityEntity } from './community.entity';
import { CommunityCreate, CommunityUpdate, CommunityListQuery } from '@comparte-tu-tiempo/contracts';

export interface CommunityRepositoryPort {
  create(data: CommunityCreate): Promise<CommunityEntity>;
  findById(id: number): Promise<CommunityEntity | null>;
  findByCreatorId(creatorId: string): Promise<CommunityEntity[]>;
  findPublic(): Promise<CommunityEntity[]>;
  update(id: number, data: CommunityUpdate): Promise<CommunityEntity>;
  delete(id: number): Promise<void>;
  list(query: CommunityListQuery): Promise<{
    communities: CommunityEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
}
