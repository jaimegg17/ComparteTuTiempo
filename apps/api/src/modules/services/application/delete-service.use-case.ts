import { Injectable, Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

export interface DeleteServiceInput { id: number; userId: string }

@Injectable()
export class DeleteServiceUseCase {
  private readonly logger = new Logger(DeleteServiceUseCase.name);

  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: ServiceRepositoryPort,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(input: DeleteServiceInput): Promise<void> {
    const existing = await this.serviceRepository.findById(input.id);
    if (!existing) throw new NotFoundException('Servicio no encontrado');
    if (existing.userId !== input.userId) throw new ForbiddenException('No autorizado');

    const existingImageUrl = existing.imageUrl ?? null;

    await this.serviceRepository.delete(input.id, input.userId);

    if (existingImageUrl && existingImageUrl.includes('res.cloudinary.com')) {
      try {
        const publicId = this.cloudinaryService.extractPublicId(existingImageUrl);
        await this.cloudinaryService.deleteImage(publicId);
      } catch (error) {
        this.logger.warn(
          `Could not clean up service image ${input.id} after deletion: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }
}
