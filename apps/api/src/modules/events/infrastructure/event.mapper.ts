import { EventEntity } from '../domain/event.entity';
import type { EventCreate } from '@comparte-tu-tiempo/contracts';
import { Prisma } from '@prisma/client';

interface EventPersistence {
  id: number;
  title?: string;
  description?: string | null;
  date: Date;
  location?: string | null;
  capacity?: number | null;
  communityId: number;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class EventMapper {
  static toDomain(prismaEvent: EventPersistence): EventEntity {
    return new EventEntity(
      prismaEvent.id,
      prismaEvent.title ?? '',
      prismaEvent.description ?? '',
      prismaEvent.date,
      prismaEvent.location ?? null,
      prismaEvent.capacity ?? null,
      prismaEvent.communityId,
      prismaEvent.createdById ?? '',
      prismaEvent.createdAt,
      prismaEvent.updatedAt,
    );
  }

  static toPrisma(event: EventEntity): Prisma.EventUncheckedCreateInput {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      capacity: event.capacity,
      communityId: event.communityId,
      createdById: event.creatorId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  static toPrismaCreate(data: EventCreate): Prisma.EventUncheckedCreateInput {
    return {
      title: data.title,
      description: data.description ?? null,
      date: data.date,
      location: data.location ?? null,
      capacity: data.capacity ?? null,
      communityId: data.communityId,
      createdById: data.creatorId,
    };
  }
}
