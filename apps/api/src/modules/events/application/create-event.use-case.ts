import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { EventRepositoryPort } from '../domain/event-repository.port';
import { EventCreate } from '@comparte-tu-tiempo/contracts';
import { EventEntity } from '../domain/event.entity';
import { EVENT_REPOSITORY_TOKEN } from '../domain/tokens';

export interface CreateEventRequest {
  data: EventCreate;
  userId: string; // The user creating the event
}

export interface CreateEventResponse {
  event: EventEntity;
}

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY_TOKEN)
    private readonly eventRepository: EventRepositoryPort
  ) {}

  async execute(request: CreateEventRequest): Promise<CreateEventResponse> {
    const { data, userId } = request;

    // Business logic validation
    if (data.creatorId !== userId) {
      throw new BadRequestException('No puedes crear eventos en nombre de otro usuario');
    }

    if (!data.title || data.title.trim().length < 3) {
      throw new BadRequestException('El título del evento debe tener al menos 3 caracteres');
    }

    if (data.title.length > 100) {
      throw new BadRequestException('El título del evento no puede exceder 100 caracteres');
    }

    if (!data.description || data.description.trim().length < 10) {
      throw new BadRequestException('La descripción debe tener al menos 10 caracteres');
    }

    if (data.description.length > 1000) {
      throw new BadRequestException('La descripción no puede exceder 1000 caracteres');
    }

    if (data.date < new Date()) {
      throw new BadRequestException('No puedes crear eventos en el pasado');
    }

    const event = await this.eventRepository.create(data);

    return { event };
  }
}
