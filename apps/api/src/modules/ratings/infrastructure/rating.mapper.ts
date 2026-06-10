import { RatingEntity } from '../domain/rating.entity';
import type { RatingCreate } from '@comparte-tu-tiempo/contracts';

interface RatingPersistence {
  id: number;
  userId: string;
  serviceId: number;
  score: number;
  comment: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

export class RatingMapper {
  static toDomain(prismaRating: RatingPersistence): RatingEntity {
    return new RatingEntity(
      prismaRating.id,
      prismaRating.userId,
      prismaRating.serviceId,
      prismaRating.score,
      prismaRating.comment,
      prismaRating.createdAt,
      prismaRating.updatedAt ?? prismaRating.createdAt,
    );
  }

  static toPrisma(rating: RatingEntity): RatingPersistence {
    return {
      id: rating.id,
      userId: rating.userId,
      serviceId: rating.serviceId,
      score: rating.score,
      comment: rating.comment,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    };
  }

  static toPrismaCreate(data: RatingCreate): Omit<RatingPersistence, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId: data.userId,
      serviceId: data.serviceId,
      score: data.score,
      comment: data.comment ?? null,
    };
  }
}
