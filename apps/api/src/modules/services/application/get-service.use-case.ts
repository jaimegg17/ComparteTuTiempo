import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import type { Service } from '../domain/service.entity';

export interface GetServiceInput { id: number }
export interface GetServiceOutput { service: Service }

@Injectable()
export class GetServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: ServiceRepositoryPort
  ) {}

  async execute(input: GetServiceInput): Promise<GetServiceOutput> {
    const service = await this.serviceRepository.findById(input.id);
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return { service };
  }
}


