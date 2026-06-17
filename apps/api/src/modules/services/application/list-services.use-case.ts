import { Injectable, Inject } from '@nestjs/common';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import { ServiceListQuery, ServiceListResponse } from '@comparte-tu-tiempo/contracts';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';

export interface ListServicesInput {
  query: ServiceListQuery;
}

export interface ListServicesOutput {
  services: ServiceListResponse['services'];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: ServiceRepositoryPort
  ) {}

  async execute(input: ListServicesInput): Promise<ListServicesOutput> {
    const { query } = input;

    // Fetch services through the repository
    const result = await this.serviceRepository.list(query);

    return {
      services: result.services,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  }
}
