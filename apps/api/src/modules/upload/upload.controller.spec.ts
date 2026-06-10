// Mock sharp BEFORE any imports
const mockMetadata = jest.fn();
const mockSharpInstance = {
  metadata: mockMetadata,
};

// Mock sharp as a factory function
jest.mock('sharp', () => {
  const mockFn = jest.fn(() => mockSharpInstance);
  return mockFn;
});

import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';

type UploadRequest = {
  user?: { sub?: string; id?: string };
  headers?: { authorization?: string };
};

describe('UploadController', () => {
  let controller: UploadController;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    mockMetadata.mockClear();

    const mockCloudinaryService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
      extractPublicId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    cloudinaryService = module.get(CloudinaryService);
  });

  describe('uploadImage', () => {
    const mockReq = {
      user: { sub: 'auth0|u1' },
      headers: { authorization: 'Bearer token' },
    };

    const mockFile: Express.Multer.File = {
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      buffer: Buffer.from('fake-image-data'),
      destination: '',
      filename: '',
      path: '',
      stream: Readable.from([]),
    };
    it('should upload valid image successfully', async () => {
      mockMetadata.mockResolvedValue({
        width: 1920,
        height: 1080,
        format: 'jpeg',
      });
      cloudinaryService.uploadImage.mockResolvedValue('https://res.cloudinary.com/test/image/upload/test.jpg');

      const result = await controller.uploadImage(mockFile, mockReq);

      expect(result.success).toBe(true);
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.url).toBe('https://res.cloudinary.com/test/image/upload/test.jpg');
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({ width: 1920, height: 1080 }),
      );
    });

    it('should reject file that is too large', async () => {
      const largeFile = {
        ...mockFile,
        size: 11 * 1024 * 1024, // >10MB
      };

      await expect(
        controller.uploadImage(largeFile, mockReq)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject image that is too small', async () => {
      mockMetadata.mockResolvedValue({
        width: 40,
        height: 40,
        format: 'jpeg',
      });

      await expect(
        controller.uploadImage(mockFile, mockReq)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject image that is too large (dimensions)', async () => {
      mockMetadata.mockResolvedValue({
        width: 7000,
        height: 3000,
        format: 'jpeg',
      });

      await expect(
        controller.uploadImage(mockFile, mockReq)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject image with invalid aspect ratio', async () => {
      mockMetadata.mockResolvedValue({
        width: 4000,
        height: 100, // Very wide image
        format: 'jpeg',
      });

      await expect(
        controller.uploadImage(mockFile, mockReq)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject image when sharp cannot read dimensions', async () => {
      mockMetadata.mockResolvedValue({
        width: undefined,
        height: undefined,
        format: 'jpeg',
      });

      await expect(
        controller.uploadImage(mockFile, mockReq)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject image when sharp fails to parse image', async () => {
      mockMetadata.mockRejectedValue(new Error('Invalid image'));

      await expect(
        controller.uploadImage(mockFile, mockReq)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when no file is provided', async () => {
      await expect(
        controller.uploadImage(null as unknown as Express.Multer.File, mockReq as UploadRequest)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const publicId = 'test-public-id';
      cloudinaryService.deleteImage.mockResolvedValue(undefined);

      const result = await controller.deleteImage(publicId);

      expect(result.success).toBe(true);
      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(publicId);
    });

    it('should reject when publicId is not provided', async () => {
      await expect(
        controller.deleteImage('')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
