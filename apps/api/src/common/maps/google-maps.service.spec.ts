import type { ConfigService } from '@nestjs/config';
import { GoogleMapsService } from './google-maps.service';

describe('GoogleMapsService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('devuelve null cuando no hay API key', async () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const service = new GoogleMapsService(configService);
    const result = await service.geocodeAddress('Madrid');

    expect(result).toBeNull();
  });

  it('mapea correctamente respuesta OK de Google Geocoding', async () => {
    const configService = {
      get: jest.fn().mockReturnValue('fake-key'),
    } as unknown as ConfigService;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'OK',
        results: [
          {
            formatted_address: 'Madrid, España',
            place_id: 'mock-place-id',
            geometry: {
              location: { lat: 40.4168, lng: -3.7038 },
            },
          },
        ],
      }),
    } as Response);

    const service = new GoogleMapsService(configService);
    const result = await service.geocodeAddress('Madrid');

    expect(result).toEqual({
      latitude: 40.4168,
      longitude: -3.7038,
      formattedAddress: 'Madrid, España',
      placeId: 'mock-place-id',
    });
  });
});
