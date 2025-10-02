import { Injectable, Inject } from '@nestjs/common';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import { Service } from '../domain/service.entity';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';
import { ServiceCreateWithImage } from '../domain/service.types';

export interface CreateServiceInput {
  data: ServiceCreateWithImage;
  userId: string;
}

export interface CreateServiceOutput {
  service: Service;
}

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: ServiceRepositoryPort
  ) {}

  async execute(input: CreateServiceInput): Promise<CreateServiceOutput> {
    const { data, userId } = input;

    // Crear el servicio usando el repositorio
    const service = await this.serviceRepository.create(data, userId);

    return { service };
  }
}
