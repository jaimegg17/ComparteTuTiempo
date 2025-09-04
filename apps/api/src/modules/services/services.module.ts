import { Module } from '@nestjs/common';
import { ServicesController } from './presentation/services.controller';
import { CreateServiceUseCase } from './application/create-service.use-case';
import { ListServicesUseCase } from './application/list-services.use-case';
import { PrismaServiceRepository } from './infrastructure/prisma-service-repository';
import { ServiceMapper } from './infrastructure/service.mapper';
import { ServiceRepositoryPort } from './domain/service-repository.port';
import { SERVICE_REPOSITORY_TOKEN } from './domain/tokens';

@Module({
  controllers: [ServicesController],
  providers: [
    CreateServiceUseCase,
    ListServicesUseCase,
    ServiceMapper,
    {
      provide: SERVICE_REPOSITORY_TOKEN,
      useClass: PrismaServiceRepository,
    },
    {
      provide: 'ServiceRepositoryPort',
      useExisting: SERVICE_REPOSITORY_TOKEN,
    },
  ],
  exports: ['ServiceRepositoryPort'],
})
export class ServicesModule {}
