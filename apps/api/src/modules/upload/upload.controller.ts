import { Controller, Post, Delete, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException, NotFoundException, UseFilters } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { HttpUploadExceptionFilter } from '@/common/filters/http-upload-exception.filter';
import { memoryStorage } from 'multer';
import sharp from 'sharp';

// Allowed MIME types and size limits (tolerant: small thumbnails and large photos allowed)
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_WIDTH = 50;
const MIN_HEIGHT = 50;
const MAX_WIDTH = 6000;
const MAX_HEIGHT = 6000;
const MAX_ASPECT_RATIO = 4; // Max ratio (width/height or height/width)
const MIN_ASPECT_RATIO = 1 / MAX_ASPECT_RATIO;

@ApiTags('upload')
@Controller('upload')
@UseFilters(HttpUploadExceptionFilter)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Subir una imagen',
    description: 'Sube una imagen a Cloudinary con validación de tipo, tamaño y dimensiones. Formatos: JPEG, PNG, WebP, GIF. Tamaño máximo: 10MB. Dimensiones: 50x50px - 6000x6000px.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPEG, PNG, WebP, GIF)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen subida correctamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        filename: { type: 'string', example: 'imagen.jpg' },
        originalName: { type: 'string', example: 'imagen.jpg' },
        size: { type: 'number', example: 102400 },
        width: { type: 'number', example: 1920 },
        height: { type: 'number', example: 1080 },
        format: { type: 'string', example: 'jpeg' },
        url: { type: 'string', example: 'https://res.cloudinary.com/...' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Error de validación (tipo, tamaño, dimensiones)' })
  @ApiResponse({ status: 401, description: 'No autenticado o token inválido' })
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
      fileSize: MAX_FILE_SIZE + 1024 * 1024, // Slightly above max so we can return our own 400 message
    },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    // Log request details for debugging
    console.log('📤 Upload request received:', {
      hasFile: !!file,
      fileName: file?.originalname,
      fileSize: file?.size,
      hasUser: !!req.user,
      userId: req.user?.sub,
      authHeader: req.headers?.authorization ? 'Present' : 'Missing',
    });

    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo. Comprueba el tamaño (máx. 10MB) y vuelve a intentarlo.');
    }

    try {
      // Validate file size (return controlled 400 so UI can show message and retry)
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
          `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB. Elige otra imagen o comprímela.`
        );
      }

      // Validate image dimensions and aspect ratio using sharp; all errors as BadRequestException
      let metadata: { width?: number; height?: number; format?: string };
      try {
        metadata = await sharp(file.buffer).metadata();
      } catch (sharpError) {
        throw new BadRequestException(
          'No se pudo procesar la imagen. Comprueba que sea un archivo de imagen válido (JPEG, PNG, WebP o GIF) e intenta de nuevo.'
        );
      }

      if (!metadata.width || !metadata.height) {
        throw new BadRequestException(
          'No se pudieron leer las dimensiones de la imagen. Elige otra imagen e intenta de nuevo.'
        );
      }

      if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
        throw new BadRequestException(
          `La imagen es demasiado pequeña. Dimensiones mínimas: ${MIN_WIDTH}x${MIN_HEIGHT}px. Elige una imagen más grande o intenta con otra.`
        );
      }

      if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
        throw new BadRequestException(
          `La imagen es demasiado grande en dimensiones. Máximo: ${MAX_WIDTH}x${MAX_HEIGHT}px. Redúcela o elige otra imagen.`
        );
      }

      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio > MAX_ASPECT_RATIO || aspectRatio < MIN_ASPECT_RATIO) {
        throw new BadRequestException(
          `La relación de aspecto no es válida. Debe estar entre ${(1 / MAX_ASPECT_RATIO).toFixed(2)}:1 y ${MAX_ASPECT_RATIO}:1. Recorta la imagen e intenta de nuevo.`
        );
      }

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
        error instanceof Error ? error.message : 'Error al subir la imagen. Inténtalo de nuevo.'
      );
    }
  }

  @Delete('image/:publicId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Eliminar una imagen',
    description: 'Elimina una imagen de Cloudinary usando su publicId'
  })
  @ApiParam({
    name: 'publicId',
    description: 'ID público de la imagen en Cloudinary',
    example: 'comparte-tu-tiempo/abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen eliminada correctamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Imagen eliminada correctamente' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado o token inválido' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
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
