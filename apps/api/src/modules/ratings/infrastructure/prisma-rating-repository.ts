import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RatingEntity } from '../domain/rating.entity';
import { RatingRepositoryPort } from '../domain/rating-repository.port';
import { RatingCreate, RatingUpdate, RatingListQuery } from '@comparte-tu-tiempo/contracts';
import { RatingMapper } from './rating.mapper';

@Injectable()
export class PrismaRatingRepository implements RatingRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: RatingCreate): Promise<RatingEntity> {
    const prismaRating = await this.prisma.rating.create({
      data: RatingMapper.toPrismaCreate(data),
    });

    return RatingMapper.toDomain(prismaRating);
  }

  async findById(id: number): Promise<RatingEntity | null> {
    const prismaRating = await this.prisma.rating.findUnique({
      where: { id },
    });

    return prismaRating ? RatingMapper.toDomain(prismaRating) : null;
  }

  async findByUserId(userId: string): Promise<RatingEntity[]> {
    const prismaRatings = await this.prisma.rating.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaRatings.map(RatingMapper.toDomain);
  }

  async findByServiceId(serviceId: number): Promise<RatingEntity[]> {
    const prismaRatings = await this.prisma.rating.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaRatings.map(RatingMapper.toDomain);
  }

  async findByUserAndService(userId: string, serviceId: number): Promise<RatingEntity | null> {
    const prismaRating = await this.prisma.rating.findFirst({
      where: {
        userId,
        serviceId,
      },
    });

    return prismaRating ? RatingMapper.toDomain(prismaRating) : null;
  }

  async update(id: number, data: RatingUpdate): Promise<RatingEntity> {
    const prismaRating = await this.prisma.rating.update({
      where: { id },
      data,
    });

    return RatingMapper.toDomain(prismaRating);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.rating.delete({
      where: { id },
    });
  }

  async list(query: RatingListQuery): Promise<{
    ratings: RatingEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, userId, serviceId, score } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.RatingWhereInput = {};
    if (userId) where.userId = userId;
    if (serviceId) where.serviceId = serviceId;
    if (score) where.score = score;

    // Get total count
    const total = await this.prisma.rating.count({ where });

    // Get paginated results
    const prismaRatings = await this.prisma.rating.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const ratings = prismaRatings.map(RatingMapper.toDomain);
    const totalPages = Math.ceil(total / pageSize);

    return {
      ratings,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
