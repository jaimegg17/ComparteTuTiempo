import { Injectable, Inject } from '@nestjs/common';
import type { RatingRepositoryPort } from '../domain/rating-repository.port';
import { RatingListQuery } from '@comparte-tu-tiempo/contracts';
import { RATING_REPOSITORY_TOKEN } from '../domain/tokens';

export interface ListRatingsRequest {
  query: RatingListQuery;
}

export interface ListRatingsResponse {
  ratings: {
    ratings: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable()
export class ListRatingsUseCase {
  constructor(
    @Inject(RATING_REPOSITORY_TOKEN)
    private readonly ratingRepository: RatingRepositoryPort
  ) {}

  async execute(request: ListRatingsRequest): Promise<ListRatingsResponse> {
    const { query } = request;

    const result = await this.ratingRepository.list(query);

    return { ratings: result };
  }
}
