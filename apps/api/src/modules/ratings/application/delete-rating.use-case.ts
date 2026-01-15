import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { RatingRepositoryPort } from '../domain/rating-repository.port';
import { RatingEntity } from '../domain/rating.entity';
import { RATING_REPOSITORY_TOKEN } from '../domain/tokens';

export interface DeleteRatingRequest {
  id: number;
  userId: string; // The user deleting the rating
}

@Injectable()
export class DeleteRatingUseCase {
  constructor(
    @Inject(RATING_REPOSITORY_TOKEN)
    private readonly ratingRepository: RatingRepositoryPort,
  ) {}

  async execute(request: DeleteRatingRequest): Promise<void> {
    const { id, userId } = request;

    const existingRating = await this.ratingRepository.findById(id);
    if (!existingRating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    // Check permissions: Only the user who created the rating can delete it
    if (existingRating.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta valoración');
    }

    await this.ratingRepository.delete(id);
  }
}
