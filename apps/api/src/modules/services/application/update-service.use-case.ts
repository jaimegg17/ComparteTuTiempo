import { Injectable, Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import type { ServiceUpdate } from '@comparte-tu-tiempo/contracts';
import type { Service } from '../domain/service.entity';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

export interface UpdateServiceInput { id: number; data: ServiceUpdate; userId: string }
export interface UpdateServiceOutput { service: Service }

@Injectable()
export class UpdateServiceUseCase {
  private readonly logger = new Logger(UpdateServiceUseCase.name);

  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: ServiceRepositoryPort,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(input: UpdateServiceInput): Promise<UpdateServiceOutput> {
    const existing = await this.serviceRepository.findById(input.id) as any;
    if (!existing) throw new NotFoundException('Servicio no encontrado');
    if (existing.userId !== input.userId) throw new ForbiddenException('No autorizado');

    const hadImageUrlField = Object.prototype.hasOwnProperty.call(input.data, 'imageUrl');
    const previousImageUrl = existing.imageUrl ?? null;

    const service = await this.serviceRepository.update(input.id, input.data, input.userId);

    if (hadImageUrlField) {
      const nextImageUrl = input.data.imageUrl ?? null;
      const shouldDeletePrevious = Boolean(
        previousImageUrl &&
          previousImageUrl !== nextImageUrl &&
          previousImageUrl.includes('res.cloudinary.com'),
      );

      if (shouldDeletePrevious) {
        try {
          const publicId = this.cloudinaryService.extractPublicId(previousImageUrl);
          await this.cloudinaryService.deleteImage(publicId);
        } catch (error) {
          this.logger.warn(
            `No se pudo limpiar imagen antigua del servicio ${input.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return { service };
  }
}

