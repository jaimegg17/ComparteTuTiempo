import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { Auth0Controller } from './presentation/auth0.controller';
import { SignUpUseCase } from './application/sign-up.use-case';
import { SignInUseCase } from './application/sign-in.use-case';
import { GetMeUseCase } from './application/get-me.use-case';
import { Auth0UserService } from './application/auth0-user.service';
import { PrismaUserRepository } from './infrastructure/prisma-user-repository';
import { UserRepositoryPort } from './domain/user-repository.port';
import { USER_REPOSITORY_TOKEN } from './domain/tokens';
import { Auth0Module } from '../../common/auth/auth0.module';

@Module({
  imports: [Auth0Module],
  controllers: [AuthController, Auth0Controller],
  providers: [
    SignUpUseCase,
    SignInUseCase,
    GetMeUseCase,
    Auth0UserService,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: PrismaUserRepository,
    },
    {
      provide: 'UserRepositoryPort',
      useExisting: USER_REPOSITORY_TOKEN,
    },
  ],
  exports: ['UserRepositoryPort'],
})
export class AuthModule {}
