import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { MembershipEntity } from '../domain/membership.entity';
import { MembershipRepositoryPort } from '../domain/membership-repository.port';
import { MembershipCreate, MembershipUpdate, MembershipListQuery } from '@comparte-tu-tiempo/contracts';
import { MembershipMapper } from './membership.mapper';

@Injectable()
export class PrismaMembershipRepository implements MembershipRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: MembershipCreate): Promise<MembershipEntity> {
    const prismaMembership = await this.prisma.membership.create({
      data: MembershipMapper.toPrismaCreate(data),
    });
    return MembershipMapper.toDomain(prismaMembership);
  }

  async findById(id: number): Promise<MembershipEntity | null> {
    const prismaMembership = await this.prisma.membership.findUnique({ where: { id } });
    return prismaMembership ? MembershipMapper.toDomain(prismaMembership) : null;
  }

  async findByUserId(userId: string): Promise<MembershipEntity[]> {
    const prismaMemberships = await this.prisma.membership.findMany({
      where: { userId },
      orderBy: { joinedAt: 'desc' },
    });
    return prismaMemberships.map(MembershipMapper.toDomain);
  }

  async findByGroupId(groupId: number): Promise<MembershipEntity[]> {
    const prismaMemberships = await this.prisma.membership.findMany({
      where: { groupId },
      orderBy: { joinedAt: 'desc' },
    });
    return prismaMemberships.map(MembershipMapper.toDomain);
  }

  async findByUserAndGroup(userId: string, groupId: number): Promise<MembershipEntity | null> {
    const prismaMembership = await this.prisma.membership.findFirst({
      where: { userId, groupId },
    });
    return prismaMembership ? MembershipMapper.toDomain(prismaMembership) : null;
  }

  async update(id: number, data: MembershipUpdate): Promise<MembershipEntity> {
    const prismaMembership = await this.prisma.membership.update({
      where: { id },
      data,
    });
    return MembershipMapper.toDomain(prismaMembership);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.membership.delete({ where: { id } });
  }

  async list(query: MembershipListQuery): Promise<{
    memberships: MembershipEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, userId, groupId, role, status } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.MembershipWhereInput = {};
    if (userId) where.userId = userId;
    if (groupId) where.groupId = groupId;
    if (role) where.role = role;
    if (status) where.status = status;

    const total = await this.prisma.membership.count({ where });
    const prismaMemberships = await this.prisma.membership.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { joinedAt: 'desc' },
    });

    const memberships = prismaMemberships.map(MembershipMapper.toDomain);
    const totalPages = Math.ceil(total / pageSize);

    return { memberships, total, page, pageSize, totalPages };
  }
}

