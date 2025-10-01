import { Module } from '@nestjs/common';
import { UsersController } from './presentation/users.controller';
import { GetUserProfileUseCase } from './application/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/update-user-profile.use-case';
import { GetUserByIdUseCase } from './application/get-user-by-id.use-case';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    GetUserByIdUseCase,
    PrismaService,
  ],
  exports: [
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    GetUserByIdUseCase,
  ],
})
export class UsersModule {}

