import { EventEntity } from '../domain/event.entity';
import type { EventCreate } from '@comparte-tu-tiempo/contracts';
import { Prisma } from '@prisma/client';

interface EventPersistence {
  id: number;
  title?: string;
  description?: string | null;
  date: Date;
  location?: string | null;
  groupId: number;
  communityId?: number;
  creatorId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class EventMapper {
  static toDomain(prismaEvent: EventPersistence): EventEntity {
    return new EventEntity(
      prismaEvent.id,
      prismaEvent.title ?? '',
      prismaEvent.description ?? '',
      prismaEvent.date,
      prismaEvent.location ?? null,
      prismaEvent.groupId ?? prismaEvent.communityId,
      prismaEvent.creatorId ?? '',
      prismaEvent.createdAt,
      prismaEvent.updatedAt ?? prismaEvent.createdAt,
    );
  }

  static toPrisma(event: EventEntity): Prisma.EventUncheckedCreateInput {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      groupId: event.communityId,
      createdAt: event.createdAt,
    };
  }

  static toPrismaCreate(data: EventCreate): Prisma.EventUncheckedCreateInput {
    return {
      title: data.title,
      description: data.description ?? null,
      date: data.date,
      location: data.location ?? null,
      groupId: data.groupId,
    };
  }
}
