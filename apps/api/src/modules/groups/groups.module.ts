import { Module } from '@nestjs/common';
import { GroupsController } from './presentation/groups.controller';
import { CreateGroupUseCase } from './application/create-group.use-case';
import { ListGroupsUseCase } from './application/list-groups.use-case';
import { PrismaGroupRepository } from './infrastructure/prisma-group-repository';
import { GROUP_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GroupsController],
  providers: [
    CreateGroupUseCase,
    ListGroupsUseCase,
    {
      provide: GROUP_REPOSITORY_TOKEN,
      useClass: PrismaGroupRepository,
    },
    {
      provide: 'GroupRepositoryPort',
      useExisting: GROUP_REPOSITORY_TOKEN,
    },
  ],
  exports: ['GroupRepositoryPort'],
})
export class GroupsModule {}
