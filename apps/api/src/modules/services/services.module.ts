import { Module } from '@nestjs/common';
import { ServicesController } from './presentation/services.controller';
import { CreateServiceUseCase } from './application/create-service.use-case';
import { ListServicesUseCase } from './application/list-services.use-case';
import { PrismaServiceRepository } from './infrastructure/prisma-service-repository';
import { ServiceMapper } from './infrastructure/service.mapper';
import { ServiceRepositoryPort } from './domain/service-repository.port';

@Module({
  controllers: [ServicesController],
  providers: [
    CreateServiceUseCase,
    ListServicesUseCase,
    ServiceMapper,
    PrismaServiceRepository,
    {
      provide: ServiceRepositoryPort,
      useClass: PrismaServiceRepository,
    },
  ],
  exports: [ServiceRepositoryPort],
})
export class ServicesModule {}
