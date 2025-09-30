import { EventEntity } from '../domain/event.entity';

export class EventMapper {
  static toDomain(prismaEvent: any): EventEntity {
    return new EventEntity(
      prismaEvent.id,
      prismaEvent.title,
      prismaEvent.description,
      prismaEvent.date,
      prismaEvent.location,
      prismaEvent.communityId,
      prismaEvent.creatorId,
      prismaEvent.createdAt,
      prismaEvent.updatedAt,
    );
  }

  static toPrisma(event: EventEntity): any {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      communityId: event.communityId,
      creatorId: event.creatorId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  static toPrismaCreate(data: any): any {
    return {
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
      communityId: data.communityId,
      creatorId: data.creatorId,
    };
  }
}
