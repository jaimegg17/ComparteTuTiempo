import { Module } from '@nestjs/common';
import { ServicesController } from './presentation/services.controller';
import { CreateServiceUseCase } from './application/create-service.use-case';
import { ListServicesUseCase } from './application/list-services.use-case';
import { PrismaServiceRepository } from './infrastructure/prisma-service-repository';
import { ServiceMapper } from './infrastructure/service.mapper';
import { SERVICE_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { GetServiceUseCase } from './application/get-service.use-case';
import { UpdateServiceUseCase } from './application/update-service.use-case';
import { DeleteServiceUseCase } from './application/delete-service.use-case';
import { CloudinaryModule } from '@/common/cloudinary/cloudinary.module';
import { MapsModule } from '@/common/maps/maps.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, MapsModule],
  controllers: [ServicesController],
  providers: [
    CreateServiceUseCase,
    ListServicesUseCase,
    GetServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
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
