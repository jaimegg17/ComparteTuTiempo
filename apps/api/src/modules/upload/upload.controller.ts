import { Controller, Post, Delete, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { memoryStorage } from 'multer';
import * as sharp from 'sharp';

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;
const MAX_WIDTH = 4000;
const MAX_HEIGHT = 4000;
const MAX_ASPECT_RATIO = 3; // Max ratio (width/height or height/width)
const MIN_ASPECT_RATIO = 1 / MAX_ASPECT_RATIO;

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(), // Use memory storage for Cloudinary
    fileFilter: (req, file, callback) => {
      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            `Tipo de archivo no permitido. Formatos permitidos: JPEG, PNG, WebP, GIF`
          ),
          false
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(`El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // Validate image dimensions and aspect ratio using sharp
      const metadata = await sharp(file.buffer).metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new BadRequestException('No se pudieron leer las dimensiones de la imagen');
      }

      // Validate dimensions
      if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
        throw new BadRequestException(
          `La imagen es demasiado pequeña. Dimensiones mínimas: ${MIN_WIDTH}x${MIN_HEIGHT}px`
        );
      }

      if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
        throw new BadRequestException(
          `La imagen es demasiado grande. Dimensiones máximas: ${MAX_WIDTH}x${MAX_HEIGHT}px`
        );
      }

      // Validate aspect ratio
      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio > MAX_ASPECT_RATIO || aspectRatio < MIN_ASPECT_RATIO) {
        throw new BadRequestException(
          `La relación de aspecto de la imagen no es válida. Debe estar entre ${(1/MAX_ASPECT_RATIO).toFixed(2)}:1 y ${MAX_ASPECT_RATIO}:1`
        );
      }

      // Upload to Cloudinary
      const imageUrl = await this.cloudinaryService.uploadImage(file, {
        width: metadata.width,
        height: metadata.height,
      });
      
      return {
        success: true,
        filename: file.originalname,
        originalName: file.originalname,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        url: imageUrl,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error al subir la imagen a Cloudinary'
      );
    }
  }

  @Delete('image/:publicId')
  @UseGuards(JwtAuthGuard)
  async deleteImage(@Param('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('publicId es requerido');
    }

    try {
      await this.cloudinaryService.deleteImage(publicId);
      return {
        success: true,
        message: 'Imagen eliminada correctamente',
      };
    } catch (error) {
      throw new NotFoundException(
        error instanceof Error ? error.message : 'Error al eliminar la imagen'
      );
    }
  }
}
