import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GoogleGeocodeLocation {
  lat: number;
  lng: number;
}

interface GoogleGeocodeResult {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: GoogleGeocodeLocation;
  };
}

interface GoogleGeocodeResponse {
  status: string;
  results: GoogleGeocodeResult[];
}

export interface GeocodedAddress {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly apiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!this.apiKey) {
      this.logger.warn(
        'GOOGLE_MAPS_API_KEY no configurada. El geocoding quedará deshabilitado.',
      );
    }
  }

  async geocodeAddress(address: string): Promise<GeocodedAddress | null> {
    const trimmedAddress = address.trim();
    if (!trimmedAddress || !this.apiKey) return null;

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', trimmedAddress);
    url.searchParams.set('key', this.apiKey);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        this.logger.warn(
          `Error HTTP geocoding (${response.status}) para dirección "${trimmedAddress}"`,
        );
        return null;
      }

      const payload = (await response.json()) as GoogleGeocodeResponse;
      if (payload.status !== 'OK' || payload.results.length === 0) {
        this.logger.warn(
          `Geocoding sin resultado para "${trimmedAddress}" (status=${payload.status})`,
        );
        return null;
      }

      const firstResult = payload.results[0];
      return {
        latitude: firstResult.geometry.location.lat,
        longitude: firstResult.geometry.location.lng,
        formattedAddress: firstResult.formatted_address,
        placeId: firstResult.place_id,
      };
    } catch (error) {
      this.logger.warn(
        `Fallo geocoding para "${trimmedAddress}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
