import { Module } from '@nestjs/common';
import { RatingsController } from './presentation/ratings.controller';
import { CreateRatingUseCase } from './application/create-rating.use-case';
import { ListRatingsUseCase } from './application/list-ratings.use-case';
import { UpdateRatingUseCase } from './application/update-rating.use-case';
import { DeleteRatingUseCase } from './application/delete-rating.use-case';
import { PrismaRatingRepository } from './infrastructure/prisma-rating-repository';
import { RATING_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RatingsController],
  providers: [
    CreateRatingUseCase,
    ListRatingsUseCase,
    UpdateRatingUseCase,
    DeleteRatingUseCase,
    {
      provide: RATING_REPOSITORY_TOKEN,
      useClass: PrismaRatingRepository,
    },
    {
      provide: 'RatingRepositoryPort',
      useExisting: RATING_REPOSITORY_TOKEN,
    },
  ],
  exports: ['RatingRepositoryPort'],
})
export class RatingsModule {}
