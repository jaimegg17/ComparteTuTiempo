import { Injectable, Inject } from '@nestjs/common';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import { ServiceListQuery } from '@comparte-tu-tiempo/contracts';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';

export interface ListServicesInput {
  query: ServiceListQuery;
}

export interface ListServicesOutput {
  services: any; // ServiceListResponse
}

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: ServiceRepositoryPort
  ) {}

  async execute(input: ListServicesInput): Promise<ListServicesOutput> {
    const { query } = input;

    // Obtener servicios usando el repositorio
    const result = await this.serviceRepository.list(query);

    return { services: result.services };
  }
}
