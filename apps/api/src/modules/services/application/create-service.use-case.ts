import { Injectable, Inject } from '@nestjs/common';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import { ServiceCreate } from '@comparte-tu-tiempo/contracts';
import { Service } from '../domain/service.entity';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';

export interface CreateServiceInput {
  data: ServiceCreate;
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
