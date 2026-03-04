import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      return values[key];
    }),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configura cloudinary con variables del ConfigService', () => {
    new CloudinaryService(mockConfigService);

    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    });
  });

  it('sube imagen y devuelve secure_url', async () => {
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (_options, callback: (error: unknown, result: { secure_url: string; public_id: string }) => void) => ({
        end: () => callback(null, { secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg', public_id: 'demo/test' }),
      }),
    );

    const service = new CloudinaryService(mockConfigService);
    const url = await service.uploadImage({
      buffer: Buffer.from('image'),
      originalname: 'photo.jpg',
    } as Express.Multer.File);

    expect(url).toBe('https://res.cloudinary.com/demo/image/upload/v1/test.jpg');
    expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
  });

  it('mapea error de api_key a mensaje amigable', async () => {
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (_options, callback: (error: { message: string; stack?: string } | null, result: unknown) => void) => ({
        end: () => callback({ message: 'Invalid api_key', stack: 'stack' }, null),
      }),
    );

    const service = new CloudinaryService(mockConfigService);

    await expect(
      service.uploadImage({
        buffer: Buffer.from('image'),
        originalname: 'photo.jpg',
      } as Express.Multer.File),
    ).rejects.toThrow('El servidor no tiene configurado el almacenamiento de imágenes');
  });

  it('elimina imagen cuando cloudinary devuelve ok', async () => {
    (cloudinary.uploader.destroy as jest.Mock).mockImplementation(
      (_publicId, _options, callback: (error: unknown, result: { result: string }) => void) =>
        callback(null, { result: 'ok' }),
    );

    const service = new CloudinaryService(mockConfigService);

    await expect(service.deleteImage('demo/test')).resolves.toBeUndefined();
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
      'demo/test',
      { invalidate: true },
      expect.any(Function),
    );
  });

  it('extrae public id desde URL de cloudinary', () => {
    const service = new CloudinaryService(mockConfigService);

    const publicId = service.extractPublicId(
      'https://res.cloudinary.com/demo/image/upload/v1/comparte-tu-tiempo/services/image_123.jpg',
    );

    expect(publicId).toContain('v1/comparte-tu-tiempo/services/image_123');
  });
});
