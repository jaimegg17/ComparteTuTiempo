import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CommunityEntity } from '../domain/community.entity';
import { CommunityRepositoryPort } from '../domain/community-repository.port';
import { CommunityCreate, CommunityUpdate, CommunityListQuery } from '@comparte-tu-tiempo/contracts';
import { CommunityMapper } from './community.mapper';

@Injectable()
export class PrismaCommunityRepository implements CommunityRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CommunityCreate): Promise<CommunityEntity> {
    const prismaCommunity = await this.prisma.$transaction(async (tx) => {
      const createdCommunity = await tx.community.create({
        data: CommunityMapper.toPrismaCreate(data),
      });

      await tx.communityMembership.upsert({
        where: {
          communityId_userId: {
            communityId: createdCommunity.id,
            userId: data.creatorId,
          },
        },
        update: {
          role: 'OWNER',
          status: 'ACTIVE',
        },
        create: {
          communityId: createdCommunity.id,
          userId: data.creatorId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });

      return createdCommunity;
    });

    return CommunityMapper.toDomain(prismaCommunity);
  }

  async findById(id: number): Promise<CommunityEntity | null> {
    const prismaCommunity = await this.prisma.community.findUnique({
      where: { id },
    });

    return prismaCommunity ? CommunityMapper.toDomain(prismaCommunity) : null;
  }

  async findByCreatorId(creatorId: string): Promise<CommunityEntity[]> {
    const prismaCommunities = await this.prisma.community.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaCommunities.map(CommunityMapper.toDomain);
  }

  async findPublic(): Promise<CommunityEntity[]> {
    const prismaCommunities = await this.prisma.community.findMany({
      where: { isPrivate: false },
      orderBy: { createdAt: 'desc' },
    });

    return prismaCommunities.map(CommunityMapper.toDomain);
  }

  async update(id: number, data: CommunityUpdate): Promise<CommunityEntity> {
    const prismaCommunity = await this.prisma.community.update({
      where: { id },
      data,
    });

    return CommunityMapper.toDomain(prismaCommunity);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.community.delete({
      where: { id },
    });
  }

  async list(query: CommunityListQuery): Promise<{
    communities: CommunityEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, creatorId, isPrivate, kind, verificationStatus } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.CommunityWhereInput = {};
    if (creatorId) where.creatorId = creatorId;
    if (isPrivate !== undefined) where.isPrivate = isPrivate;
    if (kind) where.kind = kind;
    if (verificationStatus) where.verificationStatus = verificationStatus;

    const total = await this.prisma.community.count({ where });
    const prismaCommunities = await this.prisma.community.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const communities = prismaCommunities.map((prismaCommunity) => CommunityMapper.toDomain(prismaCommunity));
    const totalPages = Math.ceil(total / pageSize);

    return {
      communities,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
