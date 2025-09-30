import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';

export interface DeleteServiceInput { id: number; userId: string }

@Injectable()
export class DeleteServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: ServiceRepositoryPort
  ) {}

  async execute(input: DeleteServiceInput): Promise<void> {
    const existing = await this.serviceRepository.findById(input.id);
    if (!existing) throw new NotFoundException('Servicio no encontrado');
    if (existing.userId !== input.userId) throw new ForbiddenException('No autorizado');
    await this.serviceRepository.delete(input.id, input.userId);
  }
}


