import { Injectable } from '@nestjs/common';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import { ServiceListQuery } from '@comparte-tu-tiempo/contracts';

export interface ListServicesInput {
  query: ServiceListQuery;
}

export interface ListServicesOutput {
  services: any; // ServiceListResponse
}

@Injectable()
export class ListServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepositoryPort) {}

  async execute(input: ListServicesInput): Promise<ListServicesOutput> {
    const { query } = input;

    // Obtener servicios usando el repositorio
    const result = await this.serviceRepository.list(query);

    return { services: result.services };
  }
}
