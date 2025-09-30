import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import type { ServiceUpdate } from '@comparte-tu-tiempo/contracts';
import type { Service } from '../domain/service.entity';

export interface UpdateServiceInput { id: number; data: ServiceUpdate; userId: string }
export interface UpdateServiceOutput { service: Service }

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: ServiceRepositoryPort
  ) {}

  async execute(input: UpdateServiceInput): Promise<UpdateServiceOutput> {
    const existing = await this.serviceRepository.findById(input.id);
    if (!existing) throw new NotFoundException('Servicio no encontrado');
    if (existing.userId !== input.userId) throw new ForbiddenException('No autorizado');
    const service = await this.serviceRepository.update(input.id, input.data, input.userId);
    return { service };
  }
}


