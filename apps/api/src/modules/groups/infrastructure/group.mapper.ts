import { GroupEntity } from '../domain/group.entity';
import type { GroupCreate } from '@comparte-tu-tiempo/contracts';

interface GroupPersistence {
  id: number;
  name: string;
  description: string | null;
  communityId?: number;
  type?: 'PUBLICO' | 'PRIVADO' | 'TRABAJO' | 'HOBBY';
  isPrivate?: boolean;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GroupMapper {
  static toDomain(prismaGroup: GroupPersistence): GroupEntity {
    return new GroupEntity(
      prismaGroup.id,
      prismaGroup.name,
      prismaGroup.description ?? '',
      prismaGroup.communityId ?? 0,
      prismaGroup.creatorId,
      prismaGroup.createdAt,
      prismaGroup.updatedAt,
    );
  }

  static toPrisma(group: GroupEntity): GroupPersistence {
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

  static toPrismaCreate(
    data: GroupCreate & { creatorId: string },
  ): Pick<GroupPersistence, 'name' | 'description' | 'type' | 'isPrivate' | 'creatorId'> {
    return {
      name: data.name,
      description: data.description ?? null,
      type: data.type,
      isPrivate: data.isPrivate,
      creatorId: data.creatorId,
    };
  }
}
