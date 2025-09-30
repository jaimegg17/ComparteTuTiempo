import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EventEntity } from '../domain/event.entity';
import { EventRepositoryPort } from '../domain/event-repository.port';
import { EventCreate, EventUpdate, EventListQuery } from '@comparte-tu-tiempo/contracts';
import { EventMapper } from './event.mapper';

@Injectable()
export class PrismaEventRepository implements EventRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: EventCreate): Promise<EventEntity> {
    const prismaEvent = await this.prisma.event.create({
      data: EventMapper.toPrismaCreate(data),
    });

    return EventMapper.toDomain(prismaEvent);
  }

  async findById(id: number): Promise<EventEntity | null> {
    const prismaEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    return prismaEvent ? EventMapper.toDomain(prismaEvent) : null;
  }

  async findByCommunityId(communityId: number): Promise<EventEntity[]> {
    const prismaEvents = await this.prisma.event.findMany({
      where: { communityId },
      orderBy: { date: 'asc' },
    });

    return prismaEvents.map(EventMapper.toDomain);
  }

  async findByCreatorId(creatorId: string): Promise<EventEntity[]> {
    const prismaEvents = await this.prisma.event.findMany({
      where: { creatorId },
      orderBy: { date: 'asc' },
    });

    return prismaEvents.map(EventMapper.toDomain);
  }

  async findUpcoming(): Promise<EventEntity[]> {
    const prismaEvents = await this.prisma.event.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      orderBy: { date: 'asc' },
    });

    return prismaEvents.map(EventMapper.toDomain);
  }

  async findPast(): Promise<EventEntity[]> {
    const prismaEvents = await this.prisma.event.findMany({
      where: {
        date: {
          lt: new Date(),
        },
      },
      orderBy: { date: 'desc' },
    });

    return prismaEvents.map(EventMapper.toDomain);
  }

  async update(id: number, data: EventUpdate): Promise<EventEntity> {
    const prismaEvent = await this.prisma.event.update({
      where: { id },
      data,
    });

    return EventMapper.toDomain(prismaEvent);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.event.delete({
      where: { id },
    });
  }

  async list(query: EventListQuery): Promise<{
    events: EventEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, communityId, creatorId, upcoming } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    if (communityId) where.communityId = communityId;
    if (creatorId) where.creatorId = creatorId;
    if (upcoming !== undefined) {
      if (upcoming) {
        where.date = { gte: new Date() };
      } else {
        where.date = { lt: new Date() };
      }
    }

    // Get total count
    const total = await this.prisma.event.count({ where });

    // Get paginated results
    const prismaEvents = await this.prisma.event.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: upcoming ? { date: 'asc' } : { date: 'desc' },
    });

    const events = prismaEvents.map(EventMapper.toDomain);
    const totalPages = Math.ceil(total / pageSize);

    return {
      events,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
