import { CommunityEntity } from '../domain/community.entity';

export class CommunityMapper {
  static toDomain(prismaCommunity: any): CommunityEntity {
    try {
      return new CommunityEntity(
        prismaCommunity.id,
        prismaCommunity.name,
        prismaCommunity.description ?? null, // Handle nullable description
        prismaCommunity.isPrivate,
        prismaCommunity.creatorId,
        prismaCommunity.createdAt instanceof Date ? prismaCommunity.createdAt : new Date(prismaCommunity.createdAt),
        prismaCommunity.updatedAt instanceof Date ? prismaCommunity.updatedAt : new Date(prismaCommunity.updatedAt),
      );
    } catch (error) {
      console.error('Error in CommunityMapper.toDomain:', error, prismaCommunity);
      throw error;
    }
  }

  static toPrisma(community: CommunityEntity): any {
    return {
      id: community.id,
      name: community.name,
      description: community.description,
      isPrivate: community.isPrivate,
      creatorId: community.creatorId,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    };
  }

  static toPrismaCreate(data: any): any {
    return {
      name: data.name,
      description: data.description,
      isPrivate: data.isPrivate,
      creatorId: data.creatorId,
    };
  }
}
