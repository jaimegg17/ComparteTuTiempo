import { Injectable, Inject } from '@nestjs/common';
import type { ServiceRepositoryPort } from '../domain/service-repository.port';
import { Service } from '../domain/service.entity';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/tokens';
import { ServiceCreateWithImage } from '../domain/service.types';
import { GoogleMapsService } from '@/common/maps/google-maps.service';

export interface CreateServiceInput {
  data: ServiceCreateWithImage;
  userId: string;
}

export interface CreateServiceOutput {
  service: Service;
}

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: ServiceRepositoryPort,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  async execute(input: CreateServiceInput): Promise<CreateServiceOutput> {
    const { data, userId } = input;
    let dataToCreate: ServiceCreateWithImage = { ...data };

    const shouldTryGeocoding = Boolean(
      data.location &&
        (data.latitude == null ||
          data.longitude == null ||
          !data.formattedAddress ||
          !data.placeId),
    );

    if (shouldTryGeocoding && data.location) {
      const geocoded = await this.googleMapsService.geocodeAddress(data.location);
      if (geocoded) {
        dataToCreate = {
          ...dataToCreate,
          latitude: data.latitude ?? geocoded.latitude,
          longitude: data.longitude ?? geocoded.longitude,
          formattedAddress: data.formattedAddress ?? geocoded.formattedAddress,
          placeId: data.placeId ?? geocoded.placeId,
        };
      }
    }

    // Crear el servicio usando el repositorio
    const service = await this.serviceRepository.create(dataToCreate, userId);

    return { service };
  }
}
