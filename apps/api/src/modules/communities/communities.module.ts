import { Module } from '@nestjs/common';
import { CommunitiesController } from './presentation/communities.controller';
import { CreateCommunityUseCase } from './application/create-community.use-case';
import { ListCommunitiesUseCase } from './application/list-communities.use-case';
import { PrismaCommunityRepository } from './infrastructure/prisma-community-repository';
import { CommunityRepositoryPort } from './domain/community-repository.port';
import { COMMUNITY_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommunitiesController],
  providers: [
    CreateCommunityUseCase,
    ListCommunitiesUseCase,
    {
      provide: COMMUNITY_REPOSITORY_TOKEN,
      useClass: PrismaCommunityRepository,
    },
    {
      provide: 'CommunityRepositoryPort',
      useExisting: COMMUNITY_REPOSITORY_TOKEN,
    },
  ],
  exports: ['CommunityRepositoryPort'],
})
export class CommunitiesModule {}
