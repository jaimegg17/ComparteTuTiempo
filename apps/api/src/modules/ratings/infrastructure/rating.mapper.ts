import { RatingEntity } from '../domain/rating.entity';

export class RatingMapper {
  static toDomain(prismaRating: any): RatingEntity {
    return new RatingEntity(
      prismaRating.id,
      prismaRating.userId,
      prismaRating.serviceId,
      prismaRating.score,
      prismaRating.comment,
      prismaRating.createdAt,
      prismaRating.updatedAt,
    );
  }

  static toPrisma(rating: RatingEntity): any {
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

  static toPrismaCreate(data: any): any {
    return {
      userId: data.userId,
      serviceId: data.serviceId,
      score: data.score,
      comment: data.comment,
    };
  }
}
