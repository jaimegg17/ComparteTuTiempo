import { EventEntity } from './event.entity';
import { EventCreate, EventUpdate, EventListQuery } from '@comparte-tu-tiempo/contracts';

export interface EventRepositoryPort {
  create(data: EventCreate): Promise<EventEntity>;
  findById(id: number): Promise<EventEntity | null>;
  findUpcoming(): Promise<EventEntity[]>;
  findPast(): Promise<EventEntity[]>;
  update(id: number, data: EventUpdate): Promise<EventEntity>;
  delete(id: number): Promise<void>;
  list(query: EventListQuery): Promise<{
    events: EventEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
}
