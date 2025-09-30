import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import type { RatingRepositoryPort } from '../domain/rating-repository.port';
import { RatingCreate } from '@comparte-tu-tiempo/contracts';
import { RatingEntity } from '../domain/rating.entity';
import { RATING_REPOSITORY_TOKEN } from '../domain/tokens';

export interface CreateRatingRequest {
  data: RatingCreate;
  userId: string; // The user creating the rating
}

export interface CreateRatingResponse {
  rating: RatingEntity;
}

@Injectable()
export class CreateRatingUseCase {
  constructor(
    @Inject(RATING_REPOSITORY_TOKEN)
    private readonly ratingRepository: RatingRepositoryPort
  ) {}

  async execute(request: CreateRatingRequest): Promise<CreateRatingResponse> {
    const { data, userId } = request;

    // Business logic validation
    if (data.userId !== userId) {
      throw new BadRequestException('No puedes crear valoraciones en nombre de otro usuario');
    }

    if (data.score < 1 || data.score > 5) {
      throw new BadRequestException('La puntuación debe estar entre 1 y 5');
    }

    if (data.comment && data.comment.length > 500) {
      throw new BadRequestException('El comentario no puede exceder 500 caracteres');
    }

    // Check if user already rated this service
    const existingRating = await this.ratingRepository.findByUserAndService(userId, data.serviceId);
    if (existingRating) {
      throw new ConflictException('Ya has valorado este servicio');
    }

    const rating = await this.ratingRepository.create(data);

    return { rating };
  }
}
