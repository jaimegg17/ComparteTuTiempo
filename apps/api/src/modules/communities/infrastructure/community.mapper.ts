import { CommunityEntity } from '../domain/community.entity';
import { Prisma, CommunityKind, VerificationStatus } from '@prisma/client';
import type { CommunityCreate, CommunityResource } from '@comparte-tu-tiempo/contracts';

interface CommunityPersistence {
  id: number;
  name: string;
  description: string | null;
  imageUrl?: string | null;
  topics?: string[] | null;
  rules?: string[] | null;
  resources?: unknown;
  kind?: 'COMMUNITY' | 'ORGANIZATION';
  verificationStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  isPrivate: boolean;
  creatorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const normalizeResources = (value: unknown): CommunityResource[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      title: typeof item.title === 'string' ? item.title : 'Recurso',
      description: typeof item.description === 'string' ? item.description : null,
      type: item.type === 'link' || item.type === 'image' || item.type === 'note' ? item.type : 'note',
      url: typeof item.url === 'string' ? item.url : null,
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : null,
    }));
};

export class CommunityMapper {
  static toDomain(prismaCommunity: CommunityPersistence): CommunityEntity {
    try {
      return new CommunityEntity(
        prismaCommunity.id,
        prismaCommunity.name,
        prismaCommunity.description ?? null, // Handle nullable description
        prismaCommunity.imageUrl ?? null,
        prismaCommunity.topics ?? [],
        prismaCommunity.rules ?? [],
        normalizeResources(prismaCommunity.resources),
        prismaCommunity.kind ?? 'COMMUNITY',
        prismaCommunity.verificationStatus ?? 'NONE',
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

  static toPrisma(community: CommunityEntity): CommunityPersistence {
    return {
      id: community.id,
      name: community.name,
      description: community.description,
      imageUrl: community.imageUrl,
      topics: community.topics,
      rules: community.rules,
      resources: community.resources,
      kind: community.kind,
      verificationStatus: community.verificationStatus,
      isPrivate: community.isPrivate,
      creatorId: community.creatorId,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    };
  }

  static toPrismaCreate(data: CommunityCreate): Prisma.CommunityUncheckedCreateInput {
    return {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl ?? null,
      topics: data.topics ?? [],
      rules: data.rules ?? [],
      resources: data.resources ?? [],
      kind: (data.kind ?? 'COMMUNITY') as CommunityKind,
      verificationStatus: (data.kind === 'ORGANIZATION' ? 'PENDING' : 'NONE') as VerificationStatus,
      isPrivate: data.isPrivate,
      creatorId: data.creatorId,
    };
  }
}
