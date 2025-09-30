import { GroupEntity } from '../domain/group.entity';

export class GroupMapper {
  static toDomain(prismaGroup: any): GroupEntity {
    return new GroupEntity(
      prismaGroup.id,
      prismaGroup.name,
      prismaGroup.description,
      prismaGroup.communityId,
      prismaGroup.creatorId,
      prismaGroup.createdAt,
      prismaGroup.updatedAt,
    );
  }

  static toPrisma(group: GroupEntity): any {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      communityId: group.communityId,
      creatorId: group.creatorId,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  static toPrismaCreate(data: any): any {
    return {
      name: data.name,
      description: data.description,
      communityId: data.communityId,
      creatorId: data.creatorId,
    };
  }
}
