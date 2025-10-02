import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import type { RatingRepositoryPort } from '../domain/rating-repository.port';
import { RatingCreate } from '@comparte-tu-tiempo/contracts';
import { RatingEntity } from '../domain/rating.entity';
import { RATING_REPOSITORY_TOKEN } from '../domain/tokens';
import { PrismaService } from '@/common/prisma/prisma.service';

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
    private readonly ratingRepository: RatingRepositoryPort,
    private readonly prisma: PrismaService,
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

    // CRITICAL: Verify user has completed an exchange for this service
    const completedExchange = await this.prisma.exchange.findFirst({
      where: {
        serviceId: data.serviceId,
        OR: [
          { requestedById: userId },
          { offeredById: userId }
        ],
        state: 'COMPLETED'
      }
    });

    if (!completedExchange) {
      throw new BadRequestException('Solo puedes valorar servicios después de completar un intercambio');
    }

    const rating = await this.ratingRepository.create(data);

    return { rating };
  }
}
