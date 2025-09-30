import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { MembershipsController } from './presentation/memberships.controller';
import { CreateMembershipUseCase } from './application/create-membership.use-case';
import { ListMembershipsUseCase } from './application/list-memberships.use-case';
import { UpdateMembershipUseCase } from './application/update-membership.use-case';
import { MEMBERSHIP_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaMembershipRepository } from './infrastructure/prisma-membership-repository';

@Module({
  imports: [PrismaModule],
  controllers: [MembershipsController],
  providers: [
    CreateMembershipUseCase,
    ListMembershipsUseCase,
    UpdateMembershipUseCase,
    {
      provide: MEMBERSHIP_REPOSITORY_TOKEN,
      useClass: PrismaMembershipRepository,
    },
    {
      provide: 'MembershipRepositoryPort',
      useExisting: MEMBERSHIP_REPOSITORY_TOKEN,
    },
  ],
  exports: ['MembershipRepositoryPort'],
})
export class MembershipsModule {}


