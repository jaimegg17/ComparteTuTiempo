import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GroupEntity } from '../domain/group.entity';
import { GroupRepositoryPort } from '../domain/group-repository.port';
import { GroupCreate, GroupUpdate, GroupListQuery } from '@comparte-tu-tiempo/contracts';
import { GroupMapper } from './group.mapper';

@Injectable()
export class PrismaGroupRepository implements GroupRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: GroupCreate): Promise<GroupEntity> {
    const prismaGroup = await this.prisma.group.create({
      data: GroupMapper.toPrismaCreate(data),
    });

    return GroupMapper.toDomain(prismaGroup);
  }

  async findById(id: number): Promise<GroupEntity | null> {
    const prismaGroup = await this.prisma.group.findUnique({
      where: { id },
    });

    return prismaGroup ? GroupMapper.toDomain(prismaGroup) : null;
  }

  async findByCommunityId(communityId: number): Promise<GroupEntity[]> {
    const prismaGroups = await this.prisma.group.findMany({
      where: { communityId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaGroups.map(GroupMapper.toDomain);
  }

  async findByCreatorId(creatorId: string): Promise<GroupEntity[]> {
    const prismaGroups = await this.prisma.group.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaGroups.map(GroupMapper.toDomain);
  }

  async update(id: number, data: GroupUpdate): Promise<GroupEntity> {
    const prismaGroup = await this.prisma.group.update({
      where: { id },
      data,
    });

    return GroupMapper.toDomain(prismaGroup);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.group.delete({
      where: { id },
    });
  }

  async list(query: GroupListQuery): Promise<{
    groups: GroupEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, communityId, creatorId } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    if (communityId) where.communityId = communityId;
    if (creatorId) where.creatorId = creatorId;

    // Get total count
    const total = await this.prisma.group.count({ where });

    // Get paginated results
    const prismaGroups = await this.prisma.group.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const groups = prismaGroups.map(GroupMapper.toDomain);
    const totalPages = Math.ceil(total / pageSize);

    return {
      groups,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
