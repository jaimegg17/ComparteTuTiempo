import { Injectable } from '@nestjs/common';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import { ServiceCreate } from '@comparte-tu-tiempo/contracts';
import { Service } from '../domain/service.entity';

export interface CreateServiceInput {
  data: ServiceCreate;
  userId: number;
}

export interface CreateServiceOutput {
  service: Service;
}

@Injectable()
export class CreateServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepositoryPort) {}

  async execute(input: CreateServiceInput): Promise<CreateServiceOutput> {
    const { data, userId } = input;

    // Crear el servicio usando el repositorio
    const service = await this.serviceRepository.create(data, userId);

    return { service };
  }
}
