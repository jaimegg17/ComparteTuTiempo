import { Injectable, Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import type { ServiceUpdate } from '@comparte-tu-tiempo/contracts';
import type { Service } from '../domain/service.entity';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { GoogleMapsService } from '@/common/maps/google-maps.service';

export interface UpdateServiceInput { id: number; data: ServiceUpdate; userId: string }
export interface UpdateServiceOutput { service: Service }

@Injectable()
export class UpdateServiceUseCase {
  private readonly logger = new Logger(UpdateServiceUseCase.name);

  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: ServiceRepositoryPort,
    private readonly cloudinaryService: CloudinaryService,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  async execute(input: UpdateServiceInput): Promise<UpdateServiceOutput> {
    const existing = await this.serviceRepository.findById(input.id);
    if (!existing) throw new NotFoundException('Servicio no encontrado');
    if (existing.userId !== input.userId) throw new ForbiddenException('No autorizado');

    const hadImageUrlField = Object.prototype.hasOwnProperty.call(input.data, 'imageUrl');
    const previousImageUrl = existing.imageUrl ?? null;

    let dataToUpdate: ServiceUpdate = { ...input.data };
    const nextLocation =
      typeof input.data.location === 'string' ? input.data.location : undefined;

    const shouldTryGeocoding = Boolean(
      nextLocation &&
        (input.data.latitude == null ||
          input.data.longitude == null ||
          input.data.formattedAddress == null ||
          input.data.placeId == null),
    );

    if (shouldTryGeocoding && nextLocation) {
      const geocoded = await this.googleMapsService.geocodeAddress(nextLocation);
      if (geocoded) {
        dataToUpdate = {
          ...dataToUpdate,
          latitude: input.data.latitude ?? geocoded.latitude,
          longitude: input.data.longitude ?? geocoded.longitude,
          formattedAddress: input.data.formattedAddress ?? geocoded.formattedAddress,
          placeId: input.data.placeId ?? geocoded.placeId,
        };
      }
    }

    const service = await this.serviceRepository.update(input.id, dataToUpdate, input.userId);

    if (hadImageUrlField) {
      const nextImageUrl = dataToUpdate.imageUrl ?? null;
      const shouldDeletePrevious = Boolean(
        previousImageUrl &&
          previousImageUrl !== nextImageUrl &&
          previousImageUrl.includes('res.cloudinary.com'),
      );

      if (shouldDeletePrevious && previousImageUrl) {
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
