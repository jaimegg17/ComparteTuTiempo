import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import type { RatingRepositoryPort } from '../domain/rating-repository.port';
import { RatingUpdate } from '@comparte-tu-tiempo/contracts';
import { RatingEntity } from '../domain/rating.entity';
import { RATING_REPOSITORY_TOKEN } from '../domain/tokens';

export interface UpdateRatingRequest {
  id: number;
  data: RatingUpdate;
  userId: string; // The user updating the rating
}

export interface UpdateRatingResponse {
  rating: RatingEntity;
}

@Injectable()
export class UpdateRatingUseCase {
  constructor(
    @Inject(RATING_REPOSITORY_TOKEN)
    private readonly ratingRepository: RatingRepositoryPort
  ) {}

  async execute(request: UpdateRatingRequest): Promise<UpdateRatingResponse> {
    const { id, data, userId } = request;

    const existingRating = await this.ratingRepository.findById(id);
    if (!existingRating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    // Check permissions: Only the user who created the rating can update it
    if (existingRating.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar esta valoración');
    }

    // Validate score if provided
    if (data.score !== undefined && (data.score < 1 || data.score > 5)) {
      throw new BadRequestException('La puntuación debe estar entre 1 y 5');
    }

    // Validate comment if provided
    if (data.comment !== undefined && data.comment && data.comment.length > 500) {
      throw new BadRequestException('El comentario no puede exceder 500 caracteres');
    }

    const updatedRating = await this.ratingRepository.update(id, data);

    return { rating: updatedRating };
  }
}
