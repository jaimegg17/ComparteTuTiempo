import { CommunityEntity } from '../domain/community.entity';

export class CommunityMapper {
  static toDomain(prismaCommunity: any): CommunityEntity {
    return new CommunityEntity(
      prismaCommunity.id,
      prismaCommunity.name,
      prismaCommunity.description,
      prismaCommunity.isPrivate,
      prismaCommunity.creatorId,
      prismaCommunity.createdAt,
      prismaCommunity.updatedAt,
    );
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
