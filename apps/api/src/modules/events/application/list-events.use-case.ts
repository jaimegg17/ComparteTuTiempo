import { Injectable, Inject } from '@nestjs/common';
import type { EventRepositoryPort } from '../domain/event-repository.port';
import { EventListQuery } from '@comparte-tu-tiempo/contracts';
import { EVENT_REPOSITORY_TOKEN } from '../domain/tokens';
import type { EventEntity } from '../domain/event.entity';

export interface ListEventsRequest {
  query: EventListQuery;
}

export interface ListEventsResponse {
  events: {
    events: EventEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable()
export class ListEventsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY_TOKEN)
    private readonly eventRepository: EventRepositoryPort
  ) {}

  async execute(request: ListEventsRequest): Promise<ListEventsResponse> {
    const { query } = request;

    const result = await this.eventRepository.list(query);

    return { events: result };
  }
}
