import { Module } from '@nestjs/common';
import { CommunitiesController } from './presentation/communities.controller';
import { CreateCommunityUseCase } from './application/create-community.use-case';
import { ListCommunitiesUseCase } from './application/list-communities.use-case';
import { PrismaCommunityRepository } from './infrastructure/prisma-community-repository';
import { COMMUNITY_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommunitiesController],
  providers: [
    CreateCommunityUseCase,
    ListCommunitiesUseCase,
    PrismaCommunityRepository,
    {
      provide: COMMUNITY_REPOSITORY_TOKEN,
      useClass: PrismaCommunityRepository,
    },
  ],
  exports: [COMMUNITY_REPOSITORY_TOKEN, PrismaCommunityRepository],
})
export class CommunitiesModule {}
